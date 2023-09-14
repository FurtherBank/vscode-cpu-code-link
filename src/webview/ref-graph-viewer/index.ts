import * as vscode from "vscode";
import { CpuBridge } from "vscode-cpu-common";
import { ITextEditorWebview } from "../../core/helper/editor/text/ITextEditor";
import debounce from "lodash/debounce";
import { findTsConfig } from "./findTsConfig";
import { CpuProjectManager } from "ts-project-toolkit";
import { VscodeRequest } from "./bridge/request";
import path from "path";

export const RefGraphViewer = (
  bridge: CpuBridge<VscodeRequest, {}, any>,
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  _token: vscode.CancellationToken
): ITextEditorWebview => {
  bridge.on("open", (payload) => {
    const { path } = payload;
    const fileUri = vscode.Uri.file(path);
    vscode.window.showTextDocument(fileUri, {
      viewColumn: vscode.ViewColumn.One,
    });
  });
  bridge.on("open-ref-graph", (payload) => {
    const { path } = payload;
    const fileUri = vscode.Uri.file(path);
    // 打开只读文档
    vscode.commands.executeCommand('vscode.openWith', fileUri, 'cpu-ref-graph.RefGraphViewer', vscode.ViewColumn.Two);
  });
  const webview = {
    viewType: "RefGraphViewer",
    title: "RefGraphViewer",
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
    htmlPath: "cpu-ref-graph/dist",
    panelListeners: {
      onDidDispose: () => {},
    },
  };

  const updateWebview = debounce(
    async (document) => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      const workspaceFolder = workspaceFolders?.[0];
      if (!workspaceFolder) {
        return;
      }
      const realFilePath = document.uri.fsPath;
      const tsConfigFilePath = await findTsConfig(realFilePath);
      const projectPath = path.dirname(tsConfigFilePath);
      console.time("openProject");
      const project = await CpuProjectManager.getProject(tsConfigFilePath);
      console.log("[main] 已经打开代码文件", tsConfigFilePath, realFilePath);
      console.timeEnd("openProject");
      console.time("analyzeCallGraph");
      const message = {
        refGraph: project.getRefGraph(realFilePath),
        projectPath,
        isDark:
          vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark,
      };
      console.timeEnd("analyzeCallGraph");

      console.log(JSON.stringify(message.refGraph));
      bridge.post("init", message);
    },
    500,
    { leading: true }
  );

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
