import * as vscode from 'vscode';

import { IWebview } from '../../webview/IWebview';

export interface ITextEditorWebview {
  webview: IWebview
  onDocumentChange: (e: vscode.TextDocumentChangeEvent) => any;
  /**
   * 在编辑器加载过程完毕之后，执行的函数。
   * 
   * 一般可以执行以下内容：
   * - 初始化文档内容
   */
  onEditorActivate: (
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ) => void | Thenable<void>
}

export type ITextEditor = (
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  _token: vscode.CancellationToken
) => ITextEditorWebview | Thenable<ITextEditorWebview>;
