import * as vscode from "vscode";
import { CpuBridge } from "vscode-cpu-common";
import { VscodeRequest } from "./request";
import {
  CpuProject,
  refactorRestore,
  refactorToIndex,
} from "ts-project-toolkit";
import path from "path";

export const registerListeners = (
  bridge: CpuBridge<VscodeRequest, {}, any>,
  project: CpuProject
) => {
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
    vscode.commands.executeCommand(
      "vscode.openWith",
      fileUri,
      "cpu-ref-graph.RefGraphViewer",
      vscode.ViewColumn.Two
    );
  });
  bridge.on("refactor-index", async (payload) => {
    const { path: filePath } = payload;
    const newPath = await refactorToIndex(project, filePath);

    // 删除原来的文件
    try {
      await vscode.workspace.fs.delete(vscode.Uri.file(filePath));
    } catch (error) {
      console.error(error);
    }

    // 打开新文档的依赖图
    const fileUri = vscode.Uri.file(newPath);
    vscode.commands.executeCommand(
      "vscode.openWith",
      fileUri,
      "cpu-ref-graph.RefGraphViewer",
      vscode.ViewColumn.Two
    );
  });
  bridge.on("refactor-restore", async (payload) => {
    const { path: filePath } = payload;
    const newPath = await refactorRestore(project, filePath);

    // 删除原来的文件
    try {
      const dirName = vscode.Uri.file(path.dirname(filePath)).with({
        scheme: "file",
      });
      await vscode.workspace.fs.delete(vscode.Uri.file(filePath));
      // 删除原目录（如果为空）
      const dir = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(filePath).with({ scheme: "file" })
      );
      if (dir.length === 0) {
        await vscode.workspace.fs.delete(dirName);
      }
    } catch (error) {
      console.error(error);
    }

    // 打开新文档的依赖图
    const fileUri = vscode.Uri.file(newPath);
    vscode.commands.executeCommand(
      "vscode.openWith",
      fileUri,
      "cpu-ref-graph.RefGraphViewer",
      vscode.ViewColumn.Two
    );
  });
};
