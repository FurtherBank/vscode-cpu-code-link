export type Message<D = any, T = string> = {
  action: T;
  payload: D;
};
