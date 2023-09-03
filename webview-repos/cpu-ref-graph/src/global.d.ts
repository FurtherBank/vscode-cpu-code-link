interface VscodeApi {
  postMessage(message: any): void;
}

declare global {
  interface Window {
    acquireVscodeApi?: () => VscodeApi;
  }
}
