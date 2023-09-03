// // 这个引用 webview/msgfromvscode
// // webview 引用这个
// interface RequestData {
//     init: {

//     }
// }
// class CpuWebviewBridge {
//     constructor() {

//     }
// }
// class CpuVscodeBridge {
//     public vscode: any
//     constructor() {
        
//     }
// }
// // 给可以返回的 action 加 listener，
// const listener = () => {
//   return {
//     init: (payload: RequestData["init"]) => {
//       return 1;
//     },
//   };
// };
// const res = await bridge.post("action", payload);

// type RepliableActions = keyof ReturnType<typeof listener>;
// type Response = { [k: string]: undefined } & ReturnType<typeof listener>
// export type ResponseData<K extends string> = K extends RepliableActions ? ReturnType<Response[K]> : undefined;

// type ReplyOfInit = Listener<"init">;


// // webviewpost.ts

// const webviewpost = <K extends keyof MsgFromWebview>(action: K, payload: MsgFromWebview[K]): ResponseData<K> => {
//     return {

//     }
// }
