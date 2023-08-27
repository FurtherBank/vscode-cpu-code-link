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
      vscode.workspace.openTextDocument(fileUri).then((document) => {
        // 显示文档在新的编辑器栏中
        vscode.window.showTextDocument(document, {
          viewColumn: vscode.ViewColumn.Two, // 在第二栏显示
          preview: false, // 预览模式（只读）
          preserveFocus: true, // 保持焦点在当前编辑器
          selection: new vscode.Selection(0, 0, 0, 0), // 设置初始选择范围
        });
      });
    }
  }
}
