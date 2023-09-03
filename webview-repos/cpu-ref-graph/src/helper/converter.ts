import { TreeGraphData } from "@antv/g6";
import {
  CallGraphNode,
  isInternalCodeModule,
} from "ts-project-toolkit/src/analyzeCallGraph";
import { calculateNodeSize } from "./compute";
import { theme } from "./theme";
import uniqueId from "lodash/uniqueId";

export interface ConvertConfig {
  ignore?: {
    external?: boolean;
  };
}

const getModuleTypeStyle = (
  data: CallGraphNode,
  isDark: boolean,
  config: ConvertConfig
) => {
  const moduleTypeStyleMap = {
    jsx: {
      stroke: theme("#4080ff", isDark),
    },
    js: {
      stroke: theme("#d0d080", isDark),
    },
    class: {
      stroke: theme("#b0ff80", isDark),
    },
    hook: {
      stroke: theme("#ffb080", isDark),
    },
    external: {
      stroke: theme("#e2e2e2", isDark),
    },
  };
  const {
    importPath,
    realFilePath,
    exportType,
    defaultName,
    namespaceName,
    children,
    stat: { size = 0 } = {},
  } = data;
  const ext = realFilePath?.split(".").pop() ?? "";
  // 注意优先级顺序
  if (!isInternalCodeModule(realFilePath)) return moduleTypeStyleMap.external;
  if (exportType === "hook") return moduleTypeStyleMap.hook;
  if (["tsx", "jsx"].includes(ext)) return moduleTypeStyleMap.jsx;
  if (exportType === "class") return moduleTypeStyleMap.class;
  if (["ts", "js"].includes(ext)) return moduleTypeStyleMap.js;
  return moduleTypeStyleMap.external;
};

/**
 * 将`CallGraphNode`转换为`TreeGraphData`  
 * 并计算节点和`CallGraphNode`有关的属性
 * @param data 
 * @param isDark 
 * @param config 
 * @param pointer 
 * @returns 
 */
export const convertTreeData = (
  data: CallGraphNode,
  isDark = false,
  config: ConvertConfig = {},
  pointer = []
): TreeGraphData => {
  try {
    const {
      importPath,
      realFilePath,
      defaultName,
      namespaceName,
      children,
      stat: { size = 0 } = {},
    } = data;
    const label = importPath.split("/").pop() ?? "";
    const depth = pointer.length;
    const filePointer = pointer.concat([label]);

    // const description = realFilePath || importPath;
    if (pointer.length === 0) {
    }
    const treeDataChildren = children
      ?.map((child: CallGraphNode) =>
        convertTreeData(child, isDark, config, filePointer)
      )
      .filter(Boolean);
    const treeData: TreeGraphData = {
      id: uniqueId(),
      label,
      // description,
      children: treeDataChildren,
      style: {
        lineWidth: calculateNodeSize(size),
        ...getModuleTypeStyle(data, isDark, config),
      },
      collapsed: treeDataChildren?.length > 0 && depth >= 3,
      originalData: data,
    };
    return treeData;
  } catch (error) {
    console.group("convertTreeData");
    console.error(error);
    console.log(data);
    console.groupEnd();
  }
};
