export class MockAgent {
  postMessage(message: any) {
    console.log(`发送信息：${JSON.stringify(message)}`);
  }
}
