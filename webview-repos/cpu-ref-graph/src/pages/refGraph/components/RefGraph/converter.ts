import { TreeGraphData } from "@antv/g6";
import { CallGraphNode } from "ts-project-toolkit";
import { calculateNodeSize } from "../../../../helper/compute";
import uniqueId from "lodash/uniqueId";
import { GlobalToken } from "antd/lib/theme";

export interface ConvertConfig {
  ignore?: {
    external?: boolean;
    hook?: boolean;
    class?: boolean;
    jsx?: boolean;
    js?: boolean;
  };
}

export type ModuleType = "external" | "hook" | "class" | "jsx" | "js";

export interface ConvertedTreeData extends TreeGraphData {
  originalData: CallGraphNode;
}

export const getModuleTypeStyleToken = (
  type: ModuleType
): keyof GlobalToken => {
  const moduleTypeStyleMap = {
    jsx: "blue",
    js: "yellow",
    class: "green",
    hook: "orange",
    external: "colorTextDisabled",
  } as const;

  // 注意优先级顺序
  if (type === "external") return moduleTypeStyleMap.external;
  if (type === "hook") return moduleTypeStyleMap.hook;
  if (type === "class") return moduleTypeStyleMap.class;
  if (type === "jsx") return moduleTypeStyleMap.jsx;
  if (type === "js") return moduleTypeStyleMap.js;

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
  token: GlobalToken,
  data: CallGraphNode,
  config: ConvertConfig = {},
  pointer = []
): ConvertedTreeData | null => {
  try {
    const {
      importPath,
      baseInfo: {
        moduleType = "external",
        moduleName,
        stat: { size = 0 } = {},
      },
      defaultName,
      namespaceName,
      children,
    } = data;
    const label = moduleName ?? importPath.split("/").pop() ?? "";
    const depth = pointer.length;
    const filePointer = pointer.concat([label]);

    // 对非根节点进行过滤
    if (pointer.length > 0) {
      const { ignore = {} } = config;
      if (ignore[moduleType]) return null;
    }

    // 计算子节点
    const treeDataChildren = children
      ?.map((child: CallGraphNode) =>
        convertTreeData(token, child, config, filePointer)
      )
      .filter(Boolean);

    // 计算节点属性
    const treeData = {
      id: uniqueId(),
      label,
      // description,
      children: treeDataChildren,
      style: {
        // stroke: {
        //   color: token[getModuleTypeStyleToken(moduleType)],
        //   width: calculateNodeSize(size),
        // },
        stroke: token[getModuleTypeStyleToken(moduleType)],
        lineWidth: calculateNodeSize(size),
      },
      collapsed: treeDataChildren?.length > 0 && depth >= 3,
      originalData: data,
    } as ConvertedTreeData;
    return treeData;
  } catch (error) {
    console.group("convertTreeData");
    console.error(error);
    console.log(data);
    console.groupEnd();
  }
};
