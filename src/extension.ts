// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { pluginName } from "./constrants/project";
import Command from "./core/command/command";
import { WebviewManager } from "./core/webview/manager";
import { loadWebviewHtml } from "./core/helper/webview/loadWebviewHtml";
import { getWebviewPathInfo } from "./core/helper/webview/getWebviewPathInfo";
import { ITextEditor } from "./core/helper/editor/text/ITextEditor";
import { RefGraphViewer } from "./webview/ref-graph-viewer";
import { Start } from "./commands/start";
import { CpuBridge } from "vscode-cpu-common";

// just fill this array by your commands, then will automatically register
// note: don't forget to fill the command in package.json
const commands: (typeof Command)[] = [Start];

/**
 * 按照`viewType: webview`的方式，填入插件使用的 webview 即可。
 *
 * 注意：
 * 1. 如果 webview 是通过 customEditor 的方式使用，请不要在这里填入；两种用途的 webview 注册逻辑不同
 * 2. 键名和`webview.viewType`需要完全一致。
 */
WebviewManager.webviews = {};

const customTextEditorWebviews: Record<string, ITextEditor> = {
  RefGraphViewer: RefGraphViewer,
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(`Congratulations, your extension "${pluginName}" is now active!`);

  commands.forEach((command) => {
    command.register(context);
  });

  WebviewManager.register(context);

  // 注册 customEditor
  Object.keys(customTextEditorWebviews).forEach((viewType) => {
    const getWebview = customTextEditorWebviews[viewType];
    const { extensionPath } = context;
    const provider = {
      async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
      ): Promise<void> {
        // 通过 bridge 进行双边通信
        const bridge = new CpuBridge(webviewPanel.webview, (listener) => {
          return webviewPanel.webview.onDidReceiveMessage(listener).dispose;
        });
        const {
          webview,
          onDocumentChange = (e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
              bridge.post("update", document.getText());
            }
          },
          onEditorActivate,
        } = await getWebview(bridge, document, webviewPanel, _token);
        const { panelListeners, htmlPath, getPanelOptions } = webview;

        // 1. 应用 webview options
        const pathInfo = getWebviewPathInfo(extensionPath, htmlPath);

        const panelOptions: vscode.WebviewPanelOptions & vscode.WebviewOptions =
          {
            localResourceRoots: [vscode.Uri.file(pathInfo.rootString)],
            ...getPanelOptions(extensionPath),
          };

        webviewPanel.webview.options = panelOptions;

        loadWebviewHtml(webviewPanel, pathInfo);

        // 2. 挂载 TextDocument Listener
        const changeDocumentSubscription =
          vscode.workspace.onDidChangeTextDocument(onDocumentChange);

        // 挂载 webviewPanel 的监听器
        const { onDidDispose, ...restListeners } = panelListeners ?? {};

        // onDidDispose 特殊，需额外清除 disposable，并移出 panels
        webviewPanel.onDidDispose(() => {
          if (onDidDispose) onDidDispose();

          changeDocumentSubscription.dispose();
        });

        // 其它：装载并写入 disposables
        const restListenerKeys = Object.keys(
          restListeners
        ) as (keyof typeof restListeners)[];

        restListenerKeys.forEach((key) => {
          const listener = restListeners[key];
          if (listener) webviewPanel[key](listener);
        });

        // 执行激活后函数
        if (onEditorActivate) {
          await onEditorActivate(document, webviewPanel, _token);
        }
      },
    };
    const registration = vscode.window.registerCustomEditorProvider(
      `${pluginName}.${viewType}`,
      provider
    );
    // 3. 激活事件中，将 registration 加入到 context.subscriptions
    context.subscriptions.push(registration);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
