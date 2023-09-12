import { CallGraphNode } from "ts-project-toolkit";

export interface VscodeRequest {
  init: {
    isDark: boolean;
    refGraph: CallGraphNode;
  };
}
