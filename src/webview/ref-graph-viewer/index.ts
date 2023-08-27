import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ITextEditorWebview } from '../../core/helper/editor/text/ITextEditor';
import debounce from 'lodash/debounce';
import { CallGraphNode, analyzeCallGraph } from 'ts-morph-trial/dist/src/analyzeCallGraph';
import { Project } from 'ts-morph';

export const RefGraphViewer = (
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  _token: vscode.CancellationToken
): ITextEditorWebview => {
  const webview = {
    viewType: 'RefGraphViewer',
    title: 'RefGraphViewer',
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
    htmlPath: 'ref-graph/build',
    onDidReceiveMessage: async function () {},
  };

  return {
    webview,
    onDocumentChange: (e) => {
    },
    onEditorActivate: async (document, webviewPanel, _token) => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      const workspaceFolder = workspaceFolders?.[0];
      if (!workspaceFolder) {
        return;
      }
      const project = new Project({
        tsConfigFilePath: path.join(workspaceFolder.uri.fsPath, 'tsconfig.json'),
      });
      const realFilePath = document.uri.fsPath;
      const sourceFile = project.getSourceFileOrThrow(document.uri.fsPath);
      const refgraph: CallGraphNode = {
        importPath: path.basename(realFilePath, path.extname(realFilePath)),
        realFilePath,
        children: analyzeCallGraph(sourceFile), 
      }
      const message = {
        msgType: 'init',
        data: refgraph,
      };
      webviewPanel.webview.postMessage(message);
      console.log('已经post', message);
    },
  };
};
