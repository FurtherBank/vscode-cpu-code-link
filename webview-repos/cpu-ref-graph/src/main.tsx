import { RefGraphApp } from "./App";
import { VscodeManager } from "./bridge/vscodeManager";
import { createRoot } from "react-dom/client";

VscodeManager.init(async () => {
  const mockRefGraphData = await fetch(
    "https://raw.githubusercontent.com/FurtherBank/vscode-cpu-code-link/main/webview-repos/cpu-ref-graph/src/mockData/callGraph.json?raw=true"
  )
    .then((res) => res.json())
    .catch((err) => {
      console.error("获取 mockRefGraphData 失败", err);
      return {};
    });
  VscodeManager.vscode.setState({
    data: {
      refGraph: mockRefGraphData,
      isDark: true,
    },
  });
}).then(() => {
  const container = document.getElementById("root");
  const root = createRoot(container);
  root.render(<RefGraphApp />);
});
