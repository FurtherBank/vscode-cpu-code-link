import { TreeGraphData } from '@antv/g6';
import { uniqueId } from 'lodash';
import { CallGraphNode, isInternalCodeModule } from 'ts-project-toolkit';
import { theme } from './theme';

export interface ConvertConfig {
  ignore?: {
    external?: boolean;
  };
}

const getModuleTypeStyle = (data: CallGraphNode, isDark: boolean, config: ConvertConfig) => {
  const moduleTypeStyleMap = {
    jsx: {
      fill: theme('#b0b0ff', isDark),
      stroke: theme('#096dd9', isDark),
    },
    js: {
      fill: theme('#fff', isDark),
      stroke: theme('#096dd9', isDark),
    },
    external: {
      fill: theme('#ddd', isDark),
      stroke: theme('#096dd9', isDark),
    },
  };
  const { importPath, realFilePath, defaultName, namespaceName, children } = data;
  const ext = realFilePath?.split('.').pop() ?? '';
  if (!isInternalCodeModule(realFilePath)) return moduleTypeStyleMap.external;
  if (['tsx', 'jsx'].includes(ext)) return moduleTypeStyleMap.jsx;
  if (['ts', 'js'].includes(ext)) return moduleTypeStyleMap.js;
  return moduleTypeStyleMap.external;
};

export const convertTreeData = (
  data: CallGraphNode,
  isDark: boolean = false,
  config: ConvertConfig = {},
  isRoot = true
): TreeGraphData => {
  const { importPath, realFilePath, defaultName, namespaceName, children } = data;
  const label = importPath.split('/').pop() ?? '';
  // const description = realFilePath || importPath;
  if (!isRoot) {
  }
  const treeData: TreeGraphData = {
    id: uniqueId(),
    label,
    // description,
    children: children?.map((child) => convertTreeData(child, isDark, config, false)).filter(Boolean),
    style: getModuleTypeStyle(data, isDark, config),
  };
  return treeData;
};
