import { useState, useEffect, useMemo } from "react";
import { bridge } from "./bridge";
import { RefGraphPage } from "./pages/refGraph";
import App from "antd/lib/app";
import ConfigProvider from "antd/lib/config-provider";
import theme from "antd/lib/theme";
import "antd/dist/reset.css";
import { CallGraphNode } from "ts-project-toolkit";

interface AppState {
  refGraph?: CallGraphNode;
  isDark?: boolean;
  projectPath?: string;
}

export const RefGraphApp = () => {
  const [state, setState] = useState<AppState>({});
  const { refGraph, isDark } = state;

  // todo: 封装成一个 hook
  useEffect(() => {
    return bridge.on("init", (data: AppState) => {
      setState(data);
    });
  }, []);

  const antdTheme = useMemo(() => {
    return {
      algorithm: isDark ? [theme.darkAlgorithm] : [],
      token: {
        borderRadius: 4,
        sizeUnit: 2,
      },
    };
  }, [isDark]);

  if (!refGraph) {
    return null;
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <RefGraphPage data={refGraph} isDark={isDark} />
      </App>
    </ConfigProvider>
  );
};
