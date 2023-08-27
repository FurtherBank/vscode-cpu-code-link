import * as vscode from 'vscode';
import Command from '../core/command/command';

export class Start extends Command {
  static commandName = 'Start';

  static execute(args: any) {
    // 获取当前活动编辑器
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const fileUri = activeEditor.document.uri;
      // 打开只读文档
      vscode.commands.executeCommand('vscode.openWith', fileUri, 'cpu-ref-graph.RefGraphViewer', vscode.ViewColumn.Two);
    }
  }
}
