import { IJsonEditorMessage, IJsonEditorState } from '../App';

interface IVscode<T, M = any> {
  postMessage: (message: M) => void;
  getState: () => T;
  setState: (state: T) => void;
}

export class VscodeManager {
  static vscode: IVscode<IJsonEditorState, IJsonEditorMessage | string> = {
    postMessage(message) {
      console.log(`发送信息：${JSON.stringify(message)}`);
    },
    getState() {
      return VscodeManager.mockState;
    },
    setState(state) {
      VscodeManager.mockState = state;
    },
  };
  private static mockState: any = '';
  public static messageHandlers: Record<string, (message: any) => void>;

  /**
   * 在入口文件最先执行，获取 vscode api
   *
   * @param mockFunction 如果获取失败，执行的 mock 函数
   */
  static init(mockFunction?: () => void) {
    // @ts-ignore
    if (window.acquireVsCodeApi) {
      // @ts-ignore
      this.vscode = window.acquireVsCodeApi();
      console.log('使用 vscode api');
    } else {
      console.log('使用 mock api');
      // mock 的场景下执行这个函数
      if (mockFunction) {
        mockFunction();
      }
    }
  }
}
