import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ITextEditorWebview } from '../../core/helper/editor/text/ITextEditor';
import debounce from 'lodash/debounce';
import { resetSchema } from './quicktype';

interface IJsonEditorMessage {
  schema?: any;
  data?: string;
  jsonIsSchema?: boolean;
  msgType: 'init' | 'update' | 'sync-schema' | 'reset-schema';
}

export const JsonEditor = (
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  _token: vscode.CancellationToken
): ITextEditorWebview => {
  const loadSchemaFileOfDocument = async (document: vscode.TextDocument) => {
    const fsPathOfDocument = document.uri.fsPath;
    const fileNameOfDocument = path.basename(fsPathOfDocument);
    try {
      // 读取文件对应的 schema，并写入 message
      const schemaFilePath = path.join(path.dirname(fsPathOfDocument), `$schema.${fileNameOfDocument}`);
      const schemaFile = await fs.promises.readFile(schemaFilePath, 'utf-8');
      if (schemaFile) {
        const schema = JSON.parse(schemaFile);
        return schema;
      }
    } catch (error) {
      return undefined;
    }
  };

  const webview = {
    viewType: 'JsonEditor',
    title: 'JsonEditor',
    getPanelOptions() {
      return {
        // Enable javascript in the webview
        enableScripts: true,
        // 该选项激活后，切换标签，内容不会重置
        retainContextWhenHidden: false,

        // 该字段限定可以在哪个文件夹下读取资源
        // localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'web-source/dist'))],
      };
    },
    htmlPath: 'webview-demo/build',
    onDidReceiveMessage: async function (message: IJsonEditorMessage | string) {
      // message 可能为 string | IJsonEditorMessage，前者纯粹修改文档，后者各有用处
      console.log(`vscode 收到消息：`, message);
      if (typeof message === 'string') {
        // data 编辑信息
        const edit = new vscode.WorkspaceEdit();

        // Just replace the entire document every time for this example extension.
        // A more complete extension should compute minimal edits instead.
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), message);

        return vscode.workspace.applyEdit(edit);
      } else {
        const { msgType } = message as IJsonEditorMessage;
        
        switch (msgType) {
          case 'sync-schema':
            // 同步 schema
            const schema = await loadSchemaFileOfDocument(document);
            if (schema) {
              const syncMessage: IJsonEditorMessage = {
                msgType: 'sync-schema',
                schema,
              };
              webviewPanel.webview.postMessage(syncMessage);
            }
            break;
          case 'reset-schema':
            // 重设 schema
            try {
              const { schemaText, schema: newSchema } = await resetSchema(document.getText(), filename);
              if (newSchema && schemaText) {
                // 将 schema 发送到 webview
                const resetMessage: IJsonEditorMessage = {
                  msgType: 'reset-schema',
                  schema: newSchema,
                };
                webviewPanel.webview.postMessage(resetMessage);

                // 写入文件
                const schemaFilename = `$schema.${filename}`;
                fs.promises.writeFile(path.join(dirname, schemaFilename), schemaText);
              }
            } catch (error) {
              console.error(error);
            }
            break;
          default:
            break;
        }
      }
    },
  };

  const dirname = path.dirname(document.uri.fsPath);
  const filename = path.basename(document.uri.fsPath);

  const syncSchemaFn = (schemaDocument: vscode.TextDocument) => {
    try {
      const json = JSON.parse(schemaDocument.getText());
      const message: IJsonEditorMessage = {
        msgType: 'update',
        schema: json,
      };
      webviewPanel.webview.postMessage(message);
    } catch (error) {
      console.log(`schema 更改同步失败，无法正常解析为 json`);
    }
  };

  const syncSchemaFnWithDebounce = debounce(syncSchemaFn, 300);

  return {
    webview,
    onDocumentChange: (e) => {
      const fsPathOfChangedUri = e.document.uri.fsPath;
      const fsPathOfDocument = document.uri.fsPath;
      if (e.document.uri.toString() === document.uri.toString()) {
        // 对 webview 发必须 trim，否则 webview 端(===, ==, localeCompare)判等为 false
        // 原因不明
        webviewPanel.webview.postMessage({
          msgType: 'update',
          data: document.getText().trim(),
        });
      } else if (path.dirname(fsPathOfChangedUri) === path.dirname(fsPathOfDocument)) {
        // 如果对应的 schema 文件变化，将变化防抖同步
        const fileNameOfChangedUri = path.basename(fsPathOfChangedUri);
        const fileNameOfDocument = path.basename(fsPathOfDocument);
        if (!fileNameOfDocument.startsWith('$schema.') && fileNameOfChangedUri === `$schema.${fileNameOfDocument}`) {
          syncSchemaFnWithDebounce(e.document);
        }
      }
    },
    onEditorActivate: async (document, webviewPanel, _token) => {
      const message: IJsonEditorMessage = {
        msgType: 'init',
        data: document.getText(),
      };
      if (filename.startsWith('$schema.')) {
        message.jsonIsSchema = true;
      } else {
        const schema = await loadSchemaFileOfDocument(document);
        if (schema) {
          message.schema = schema;
        }
      }
      webviewPanel.webview.postMessage(message);
      console.log('已经post');
    },
  };
};
