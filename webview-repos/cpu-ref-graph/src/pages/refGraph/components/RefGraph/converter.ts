import { TreeGraphData } from "@antv/g6";
import {
  CallGraphNode,
  isInternalCodeModule,
} from "ts-project-toolkit/src/analyzeCallGraph";
import { calculateNodeSize } from "../../../../helper/compute";
import { theme } from "../../../../helper/theme";
import uniqueId from "lodash/uniqueId";
import { type } from "os";

export interface ConvertConfig {
  ignore?: {
    external?: boolean;
    hook?: boolean;
    class?: boolean;
    jsx?: boolean;
    js?: boolean;
  };
}

const getModuleType = (data: CallGraphNode): ModuleType => {
  const {
    importPath,
    realFilePath,
    exportType,
    defaultName,
    namespaceName,
    children,
  } = data;
  const ext = realFilePath?.split(".").pop() ?? "";
  
  if (!isInternalCodeModule(realFilePath)) return 'external';
  if (exportType === "hook") return 'hook';
  if (["tsx", "jsx"].includes(ext)) return 'jsx';
  if (exportType === "class") return 'class';
  if (["ts", "js"].includes(ext)) return 'js';

  return 'external';
}

export type ModuleType = "external" | "hook" | "class" | "jsx" | "js";

const getModuleTypeStyle = (
  isDark: boolean,
  type: ModuleType,
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

  // 注意优先级顺序
  if (type === "external") return moduleTypeStyleMap.external;
  if (type === "hook") return moduleTypeStyleMap.hook;
  if (type === "class") return moduleTypeStyleMap.class;
  if (type === "jsx") return moduleTypeStyleMap.jsx;
  if (type === "js") return moduleTypeStyleMap.js;

  return moduleTypeStyleMap.external
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
): TreeGraphData | null => {
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

    // 计算模块参数
    const moduleType = getModuleType(data);

    // 对非根节点进行过滤
    if (pointer.length > 0) {
      const { ignore = {} } = config;
      if (ignore[moduleType]) return null;
    }

    // 计算子节点
    const treeDataChildren = children
      ?.map((child: CallGraphNode) =>
        convertTreeData(child, isDark, config, filePointer)
      )
      .filter(Boolean);
    
    // 计算节点属性
    const treeData: TreeGraphData = {
      id: uniqueId(),
      label,
      // description,
      children: treeDataChildren,
      style: {
        lineWidth: calculateNodeSize(size),
        ...getModuleTypeStyle(isDark, moduleType),
      },
      moduleType,
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
