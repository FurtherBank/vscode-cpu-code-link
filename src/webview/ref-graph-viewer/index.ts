import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ITextEditorWebview } from '../../core/helper/editor/text/ITextEditor';
import debounce from 'lodash/debounce';
import { Project } from 'ts-morph';
import { findTsConfig } from './findTsConfig';
import { CallGraphNode, analyzeCallGraph } from 'ts-project-toolkit';

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
    htmlPath: 'cpu-ref-graph/dist',
    onDidReceiveMessage: async function () {},
  };

  const updateWebview = debounce(async (document) => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspaceFolder = workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }
    const tsConfigFilePath = await findTsConfig(document.uri.fsPath);
    const project = new Project({
      tsConfigFilePath,
    });
    const realFilePath = document.uri.fsPath;
    console.log('[main] 已经打开代码文件', tsConfigFilePath, realFilePath);
    console.time('analyzeCallGraph');
    const sourceFile = project.getSourceFileOrThrow(realFilePath);
    const analyzedFiles = new Set<string>();
    const refGraph: CallGraphNode = {
      importPath: path.basename(realFilePath, path.extname(realFilePath)),
      realFilePath,
      children: analyzeCallGraph(sourceFile, analyzedFiles) as CallGraphNode[], 
    }
    const message = {
      msgType: 'init',
      data: {
        refGraph,
        isDark: vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark,
      },
    };
    console.timeEnd('analyzeCallGraph');
    console.log(`[main] ${analyzedFiles.size} 文件分析完毕`, message);
    
    webviewPanel.webview.postMessage(message);
  }, 500);

  return {
    webview,
    onDocumentChange: (e: vscode.TextDocumentChangeEvent) => {
      // updateWebview(e.document);
    },
    onEditorActivate: async (document, webviewPanel, _token) => {
      updateWebview(document);
    },
  };
};
