import * as vscode from 'vscode';

export interface PanelListeners<T = void> {
  /**
   * Fired when the panel's view state changes.
   */
  readonly onDidChangeViewState?: (this: T, e: vscode.WebviewPanelOnDidChangeViewStateEvent) => any;

  /**
   * Fired when the panel is disposed.
   *
   * This may be because the user closed the panel or because `.dispose()` was
   * called on it.
   *
   * Trying to use the panel after it has been disposed throws an exception.
   */
  readonly onDidDispose?: (this: T, e: void) => any;
}

/**
 * webview 的具体接口。
 *
 * 注：
 * 1. 涉及到`this`的转移问题，实现接口的对象中，请不要使用箭头函数！
 * 2. 如果函数中需要引入依赖项，请在 webview 对象的代码文件中导入依赖，通过闭包的方式引入即可
 * 3. 目前的定义中，无法在 vscode 主进程实时获取 webview 的状态。后面会给接口优化这一点。
 */
export interface IWebview<T = void> {
  /**
   * Identifies the type of the webview panel, such as `'markdown.preview'`.
   */
  readonly viewType: string;

  /**
   * Title of the panel shown in UI.
   */
  title: string;

  /**
   * Icon for the panel shown in UI.
   */
  iconPath?: vscode.Uri | { readonly light: vscode.Uri; readonly dark: vscode.Uri };

  /**
   * 在插件路径下，html 文件的目录路径。
   *
   * 实际读取该路径下的`index.html`作为 webview 内容。
   */
  htmlPath: string;

  /**
   * 使用该 webview 创建 panel 时，使用的参数
   */
  readonly getPanelOptions: (
    this: T,
    extensionPath: string
  ) => (vscode.WebviewPanelOptions & vscode.WebviewOptions) | undefined;

  onDidReceiveMessage?: (this: T, m: any) => void;

  panelListeners?: PanelListeners<T>;
  
  /**
   * webviewPanel 在 [反序列化](https://www.yuque.com/furtherbank/vscode-learn/nwooxr#LkWuX) 时执行的函数。
   * 
   * 插件模板会自动在`deserializeWebviewPanel`中恢复 webview 原来的状态。
   * 
   * 如果你还需要做其它额外的事情，才需要声明该函数。
   */
  deserialize?: (this: T, webviewPanel: vscode.WebviewPanel, state: any) => Promise<any>;
}
