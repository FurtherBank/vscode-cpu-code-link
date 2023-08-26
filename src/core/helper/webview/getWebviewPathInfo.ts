import * as vscode from 'vscode';
import * as path from 'path';

export interface IWebviewPathInfo {
  localResourceRoots: vscode.Uri;
  pagePath: string;
  rootString: string;
}

export const getWebviewPathInfo = (extensionPath: string, htmlPath: string) => {
  // 读取 html，并做环境兼容
  const rootString = path.join(extensionPath, htmlPath);
  const localResourceRoots = vscode.Uri.file(path.join(rootString, '/')).with({
    scheme: 'vscode-resource',
  });
  return {
    localResourceRoots,
    rootString,
    pagePath: path.join(rootString, 'index.html'),
  };
};
