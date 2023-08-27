import { TreeGraphData } from '@antv/g6';
import { uniqueId } from 'lodash';
import { isInternalCodeModule } from 'ts-morph-trial/dist/src/analyzeCallGraph';

export interface ImportInfo {
  importPath: string;
  realFilePath?: string;
  defaultName?: string;
  namespaceName?: string;
  namedImports: string[];
}
export type CallGraphNode = Omit<ImportInfo, 'namedImports'> & {
  children?: CallGraphNode[];
};

const moduleTypeStyleMap = {
  jsx: {
    fill: '#b0b0ff',
    stroke: '#096dd9',
  },
  js: {
    fill: '#fff',
    stroke: '#096dd9',
  },
  external: {
    fill: '#ddd',
    stroke: '#096dd9',
  },
};

const getModuleTypeStyle = (data: CallGraphNode) => {
  const { importPath, realFilePath, defaultName, namespaceName, children } = data;
  const ext = realFilePath?.split('.').pop() ?? '';
  if (!isInternalCodeModule(realFilePath)) return moduleTypeStyleMap.external;
  if (['tsx', 'jsx'].includes(ext)) return moduleTypeStyleMap.jsx;
  if (['ts', 'js'].includes(ext)) return moduleTypeStyleMap.js;
  return moduleTypeStyleMap.external;
};

export const convertTreeData = (data: CallGraphNode): TreeGraphData => {
  const { importPath, realFilePath, defaultName, namespaceName, children } = data;
  const label = importPath.split('/').pop() ?? '';
  // const description = realFilePath || importPath;
  const treeData: TreeGraphData = {
    id: uniqueId(),
    label,
    // description,
    children: children?.map(convertTreeData),
    style: getModuleTypeStyle(data),
  };
  return treeData;
};
