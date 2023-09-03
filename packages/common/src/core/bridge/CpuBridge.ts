import { v4 as uuid } from "uuid";

export interface IPostMessage {
  postMessage: (message: any) => void;
}
export interface IEvent {
  data: any;
}

export type Observe = (listener: (event: IEvent) => void) => void;

export abstract class CpuBridge<
  /** 自己 post 的 message 类型映射 */
  MyRequest extends Record<string, any>,
  /** 对方返回的 message 类型映射 */
  AgentResponse extends Record<string, any>
> {
  private requestPool: Record<
    string,
    {
      resolve: (data: any) => void;
      reject: (data: any) => void;
    }
  > = {};
  public listener: (event: IEvent) => void

  /**
   * 通用双方通信抽象类
   * @param agent 向对方通信的代理
   * @param observe 我方监听对方消息方法
   * @param handlers 监听对方消息的回调
   */
  constructor(
    private agent: IPostMessage,
    observe: Observe,
    public handlers: { [k: string]: (payload: any) => any },
  ) {
    this.handlers = handlers;
    this.requestPool = {};

    this.listener = (event) => {
      const { requestId, responseId, action, payload, data } = event.data;
      if (requestId !== undefined) {
        // requestId 不为空是来自 vscode 的请求，此外是 getState 的返回值
        const responseData = this.handlers[action]
          ? this.handlers[action](payload)
          : null;
        if (requestId) this.response(requestId, action, responseData);
        return;
      }
      if (responseId) {
        // responseId 不为空是来自 vscode 的响应
        const request = this.requestPool[responseId];
        if (request) {
          const { resolve } = request;
          resolve(data);
          delete this.requestPool[requestId];
        } else {
          console.error(
            `请求 ${responseId} 返回结果但不在请求池中，可能超时，请检查`,
            data,
            this.requestPool
          );
        }
        return;
      }
    }
    observe(this.listener);
  }

  public post<T extends keyof MyRequest>(action: T, payload: MyRequest[T]) {
    const requestId = uuid();
    this.agent.postMessage({
      action,
      payload,
      requestId,
    });
    const promise = new Promise((resolve, reject) => {
      // 超时处理
      setTimeout(() => {
        reject({
          success: false,
          errorMsg: "请求超时",
        });
        delete this.requestPool[requestId];
      }, 10000);

      this.requestPool[requestId] = {
        resolve,
        reject,
      };
    });

    return promise as Promise<
      T extends keyof AgentResponse ? AgentResponse[T] : null
    >;
  }

  private response(requestId: string, action: string, data: any) {
    this.agent.postMessage({
      responseId: requestId,
      action,
      data,
    });
  }
}
