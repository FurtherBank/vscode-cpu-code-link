export class MockObserver {
  listener?: (event: any) => void;
  observe(listener: (event: any) => void) {
    this.listener = listener;
    return () => {
      this.listener = undefined;
    };
  }
  event(data: any) {
    if (this.listener) {
      this.listener({ data });
    }
  }
}
