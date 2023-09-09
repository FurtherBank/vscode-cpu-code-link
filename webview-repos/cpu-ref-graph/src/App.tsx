import { useState, useEffect } from "react";
import { VscodeManager } from "./bridge/vscodeManager";
import RefGraphPage from "./pages/refGraph";
import App from "antd/lib/app";
import ConfigProvider from "antd/lib/config-provider";
import theme from "antd/lib/theme";
import 'antd/dist/reset.css'

export const RefGraphApp = () => {
  const [state, setState] = useState<any>({});
  const { data } = state;

  // todo: 封装成一个 hook
  useEffect(() => {
    const oldState = VscodeManager.vscode.getState();
    if (oldState !== undefined) {
      console.log("查询到 oldState", oldState);
      setState(oldState);
      return;
    }
    function listener(event: MessageEvent<any>) {
      // 通过处理机制来处理
      const { data } = event;
      console.log(`收到激活信息：`, event);
      if (typeof event === "object") {
        const { msgType, ...initState } = data;

        VscodeManager.vscode.setState(initState);

        setState(data);
      }
      window.removeEventListener("message", listener);
    }

    // 等监听到 data 信息再挂载组件，只执行一次
    window.addEventListener("message", listener);
  }, []);

  if (!data) {
    return null;
  }
  const { refGraph, isDark } = data;

  return (
    <ConfigProvider
      theme={{ algorithm: [theme.darkAlgorithm, theme.compactAlgorithm] }}
    >
      <App>
        <RefGraphPage data={refGraph} isDark={isDark} />
      </App>
    </ConfigProvider>
  );
};
