import * as vscode from 'vscode';
import { pluginName } from '../../constrants/project';
import { getWebviewPathInfo } from '../helper/webview/getWebviewPathInfo';
import { IWebview } from '../helper/webview/IWebview';
import { loadWebviewHtml } from '../helper/webview/loadWebviewHtml';

interface WebviewPanelContent {
  panel: vscode.WebviewPanel;
  disposables: vscode.Disposable[];
}

export class WebviewManager {
  static webviews: Record<string, IWebview> = {};
  static panels: Record<string, WebviewPanelContent> = {};

  /**
   * 统一注册插件中定义的 webviews
   * @param context
   */
  static register(context: vscode.ExtensionContext) {
    for (const key in WebviewManager.webviews) {
      if (Object.prototype.hasOwnProperty.call(WebviewManager.webviews, key)) {
        const webview = WebviewManager.webviews[key];
        const { viewType, deserialize = async () => {} } = webview;

        // 自动注册对应 webview 的 open 命令
        let disposable = vscode.commands.registerCommand(`${pluginName}.open${viewType}`, () => {
          WebviewManager.show(context, webview);
        });
        context.subscriptions.push(disposable);

        // 反序列化
        if (vscode.window.registerWebviewPanelSerializer) {
          // Make sure we register a serializer in activation event
          vscode.window.registerWebviewPanelSerializer(viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: unknown) {
              WebviewManager.show(context, webview, webviewPanel)
              deserialize(webviewPanel, state)
            },
          });
        }
      }
    }
  }

  /**
   * 直接展示一个对应的 webview
   * @param context
   * @param webview
   * @param attachingPanel 如果需要给未挂载 webview 的 panel 挂载，传入这个参数
   * @returns
   */
  private static show(context: vscode.ExtensionContext, webview: IWebview, attachingPanel?: vscode.WebviewPanel) {
    const { extensionPath } = context;
    const { title, viewType, getPanelOptions, htmlPath, onDidReceiveMessage, panelListeners } = webview;
    const activeEditor = vscode.window.activeTextEditor;
    let column = activeEditor ? activeEditor.viewColumn : undefined;

    const existingPanel = WebviewManager.panels[viewType];
    // If we already have a panel, show it.
    // Otherwise, create a new panel.
    if (existingPanel) {
      existingPanel.panel.reveal(column);
    } else {
      const pathInfo = getWebviewPathInfo(extensionPath, htmlPath);

      const panelOptions: vscode.WebviewPanelOptions & vscode.WebviewOptions = {
        localResourceRoots: [vscode.Uri.file(pathInfo.rootString)],
        ...getPanelOptions(extensionPath),
      };

      // 开启一个新 panel，然后传入对应的 webView 内容
      const panel = attachingPanel
        ? attachingPanel
        : vscode.window.createWebviewPanel(viewType, title, column || vscode.ViewColumn.One, panelOptions);

      const panelContent: WebviewPanelContent = {
        panel,
        disposables: [],
      };

      loadWebviewHtml(panel, pathInfo);

      // 消息通信，自己负责消息的具体解析和处理
      if (onDidReceiveMessage) {
        panel.webview.onDidReceiveMessage(onDidReceiveMessage, undefined, panelContent.disposables);
      }

      // 挂载 panel 的监听器
      const { onDidDispose, ...restListeners } = panelListeners ?? {};

      // onDidDispose 特殊，需额外清除 disposable，并移出 panels
      panel.onDidDispose(
        () => {
          if (onDidDispose) onDidDispose();

          // 释放所有 disposable，并删除这一个 webviewPanelContent
          const panelContent = WebviewManager.panels[viewType];
          panelContent.disposables.forEach((d) => d.dispose());

          delete WebviewManager.panels[viewType];
        },
        undefined,
        panelContent.disposables
      );

      // 其它：装载并写入 disposables
      const restListenerKeys = Object.keys(restListeners) as (keyof typeof restListeners)[];

      restListenerKeys.forEach((key) => {
        const listener = restListeners[key];
        if (listener) panel[key](listener, undefined, panelContent.disposables);
      });

      WebviewManager.panels[viewType] = panelContent;
    }
    return WebviewManager.panels[viewType];
  }
}
