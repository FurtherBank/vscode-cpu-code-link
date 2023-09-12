import { v4 as uuid } from "uuid";

export type Union<T, U> = {
  [Key in keyof T | keyof U]: Key extends keyof T & keyof U
    ? T[Key] | U[Key]
    : Key extends keyof T
    ? T[Key] | undefined
    : Key extends keyof U
    ? U[Key] | undefined
    : never;
};

export interface IPostMessage {
  postMessage: (message: any) => void;
}

export interface CommonRequest<T = any> {
  requestId: string;
  action: string;
  payload: T;
}

export interface CommonResponse<T = any> {
  responseId: string;
  action: string;
  data: T;
}

export type Observe = (
  listener: (message: CommonRequest | CommonResponse) => void
) => () => void;

export class CpuBridge<
  /** 自己 post 的 message 类型映射 */
  MyRequest = Record<string, any>,
  /** 对方返回的 message 类型映射 */
  AgentResponse = Record<string, any>,
  /** 对方返回的 message 类型映射 */
  AgentRequest = Record<string, any>
> {
  private requestPool: Record<
    string,
    {
      resolve: (data: any) => void;
      reject: (data: any) => void;
    }
  > = {};
  public listener: (message: any) => void;
  private removeListener: () => void;

  /**
   * 通用双方通信抽象类
   * @param agent 向对方通信的代理
   * @param observe 我方监听对方消息方法
   * @param handlers 监听对方消息的回调
   */
  constructor(
    private agent: IPostMessage,
    observe: Observe,
    public handlers: { [k: string]: (payload: any) => any } = {}
  ) {
    this.handlers = handlers;
    this.requestPool = {};

    this.listener = async (message: CommonRequest | CommonResponse) => {
      const { requestId, responseId, action, payload, data } = message as Union<
        CommonRequest,
        CommonResponse
      >;
      // requestId 存在，是对方 post 的请求
      if (requestId !== undefined) {
        console.log(`[bridge] receive request ${action}: ${requestId}`);
        const responseData = this.handlers[action]
          ? await this.handlers[action](payload)
          : null;
        if (requestId) this.response(requestId, action, responseData);
        return;
      }

      if (responseId) {
        // responseId 不为空是来自 vscode 的响应
        const request = this.requestPool[responseId];
        if (request) {
          console.log(`[bridge] receive response ${action}: ${requestId}`);
          const { resolve } = request;
          resolve(data);
          delete this.requestPool[responseId];
        } else {
          console.error(
            `请求 ${responseId} 返回结果但不在请求池中，可能超时，请检查`,
            data,
            this.requestPool
          );
        }
        return;
      }
    };
    this.removeListener = observe(this.listener);
  }

  public post<T extends keyof MyRequest & string>(action: T, payload: MyRequest[T]) {
    const requestId = uuid();
    this.agent.postMessage({
      action,
      payload,
      requestId,
    });
    console.log(`[bridge] post ${action}: ${requestId}`);
    
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
    console.log(`[bridge] response ${action}: ${requestId}`);
    this.agent.postMessage({
      responseId: requestId,
      action,
      data,
    });
  }

  on<T extends keyof AgentRequest & string>(action: T, handler: (payload: AgentRequest[T]) => any) {
    this.handlers[action] = handler;
    return () => {
      delete this.handlers[action];
    };
  }

  destroy() {
    this.removeListener();
  }
}
