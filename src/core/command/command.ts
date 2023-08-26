import * as vscode from 'vscode';
import { pluginName } from '../../constrants/project';

/**
 * 简单的插件命令注册封装
 */
export default class Command {
  static readonly commandName?: string = '';
  static execute?: (args: any) => void;
  static response?: (args: any) => void;
  static register(context: vscode.ExtensionContext) {
    const name = this.commandName ? this.commandName : this.name;
    if (name && this.execute) {
      let disposable = vscode.commands.registerCommand(`${pluginName}.${name}`, this.execute);
      context.subscriptions.push(disposable);
      if (this.response) {
        // 如果规定了 response 函数，会注册一个 nameResponse 命令用于消息传递回传
        let disposable = vscode.commands.registerCommand(`${pluginName}.${name}Response`, this.response);
        context.subscriptions.push(disposable);
      }
    } else if (this.execute) {
      throw new Error(
        `A command has no name to register, please check all command classes have classname or static commandName property.`
      );
    } else {
      throw new Error(`The execute function of command ${name} is not defined.`);
    }
  }
}
