import { CpuBridge } from "vscode-cpu-common";
import { RefGraphRequest } from "./types/request";

interface IVscode<T, M = any> {
  postMessage: (message: M) => void;
  getState: () => T;
  setState: (state: T) => void;
}

const mockVscode = {
  mockState: {},
  postMessage(message) {
    console.log(`发送信息：${JSON.stringify(message)}`);
  },
  getState() {
    return this.mockState;
  },
  setState(state) {
    this.mockState = state;
  },
}

class CpuRefGraphBridge extends CpuBridge<RefGraphRequest, any> {
  vscode: IVscode<any, any>;
  public messageHandlers: Record<string, (message: any) => void>;

  constructor() {
    // @ts-ignore
    const vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : mockVscode;
    // @ts-ignore
    if (window.acquireVsCodeApi) {
      console.log("使用 vscode api");
    } else {
      // mock 的时候请求 mock data
      console.log("使用 mock api");
      fetch(
        "https://raw.githubusercontent.com/FurtherBank/vscode-cpu-code-link/main/webview-repos/cpu-ref-graph/src/mockData/callGraph.json?raw=true"
      )
        .then((res) => res.json())
        .then((data) => {
          // 打到 window message 事件上
          window.postMessage({
            action: 'init',
            payload: {
              refGraph: data,
              isDark: Math.random() > 0.5,
            },
            requestId: ''
          })
          console.log("获取 mock data 成功");
        })
        .catch((err) => {
          console.error("获取 mockRefGraphData 失败", err);
          return {};
        });
    }
    super(vscode, (listener) => {
      const realListener = (e: MessageEvent) => {
        listener(e.data);
      };
      window.addEventListener("message", realListener);
      return () => window.removeEventListener("message", realListener);
    });
    this.vscode = vscode
  }
}

export const bridge = new CpuRefGraphBridge();
