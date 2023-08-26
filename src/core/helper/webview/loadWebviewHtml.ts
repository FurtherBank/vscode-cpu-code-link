import * as vscode from 'vscode';
import * as fs from 'fs';
import { IWebviewPathInfo } from './getWebviewPathInfo';

const initJS = `
function initEventListener(fn) {
  window.addEventListener('message', event => {
    const message = event.data;
    if (message.command.match(/Response$/) && message.contents) {
      message.contents.forEach(content => {
        let element = document.getElementById(content.id);
        element.innerHTML = content.body;
      });
    } else {
      if (fn) {
        fn(message);
      }
    }
  });
}
`;

export const loadWebviewHtml = (panel: vscode.WebviewPanel, pathInfo: IWebviewPathInfo) => {
  const { rootString, pagePath } = pathInfo;

  const fileUri = vscode.Uri.file(rootString.endsWith('/') ? rootString : rootString + '/');

  // 直接将 base 和 script 插入到 head 头部，不需要对 html 文件再做标记
  const modelString = `<head>
    <base href="${panel.webview.asWebviewUri(fileUri).toString()}" />
    <script type="text/javascript">
      "${initJS}"
    </script>`;


  panel.webview.html = fs
    .readFileSync(pagePath, 'utf-8')
    .replace('<head>', modelString)
    .replace(/src\s*=\s*([\'\"])\//g, 'src=$1') // 去掉 src 左边的 /，使 base 可以正常工作n
    .replace(/href\s*=\s*([\'\"])\//g, 'href=$1'); // 去掉 href 左边的 /，使 base 可以正常工作

    console.log(panel.webview.html);
};
