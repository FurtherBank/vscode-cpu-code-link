import { SourceFile } from 'ts-morph';
import { ImportInfo, analyzeImports } from './analyzeImports';
import { analyzeExports } from './analyzeExports';

export type CallGraphNode = Omit<ImportInfo, 'namedImports'> & {
  children?: CallGraphNode[];
};

const CodeExtension = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * 通过 realFilePath 判断是否是内部模块。
 * 以下情况不是内部模块：
 * - realFilePath 不存在
 * - realFilePath 包含 node_modules
 * - realFilePath 不是 ts、tsx、js、jsx 文件
 * @param realFilePath
 * @returns
 */
export const isInternalCodeModule = (realFilePath: string | undefined) => {
  if (!realFilePath || realFilePath?.includes('node_modules')) return false;
  return CodeExtension.some((ext) => realFilePath.endsWith(ext));
};

/**
 * 获取一个文件的调用树
 * @param sourceFile
 * @returns
 */
export const analyzeCallGraph = (sourceFile: SourceFile, analyzedFiles?: Set<SourceFile>) => {
  if (!analyzedFiles) {
    analyzedFiles = new Set();
  }
  const importModulesInfo = analyzeImports(sourceFile);
  console.log(`[info] imports of ${sourceFile.getFilePath()}`, importModulesInfo);

  return importModulesInfo
    .map((importModuleInfo) => {
      const { realFilePath, importPath, defaultName, namespaceName, namedImports } = importModuleInfo;
      if (analyzedFiles!.has(sourceFile)) {
        return false;
      }
      if (isInternalCodeModule(realFilePath)) {
        const exportSourceFile = sourceFile.getProject().getSourceFile(realFilePath!);
        if (exportSourceFile) {
          const { defaultExport, namedExports } = analyzeExports(exportSourceFile!);
          console.log(`[info] exports of ${importPath}`, { defaultExport, namedExports });
          
          // 这里认为 default 导出的不是 type，只对 named 导出的 type 进行处理
          const importedItems = namedImports.map((name) => {
            const isTypeOnly = namedExports.some((item) => item.name === name && item.isTypeOnly);
            return { name, isTypeOnly };
          });
          const onlyTypeImports = !defaultExport && importedItems.every((item) => item.isTypeOnly);
          if (!onlyTypeImports) {
            return {
              realFilePath,
              importPath,
              defaultName,
              namespaceName,
              // children 在下一个 map 中计算，从而实现层次遍历
              children: exportSourceFile,
            };
          } else {
            return false;
          }
        }
      }
      // 非内部模块的情况
      return {
        realFilePath,
        importPath,
        defaultName,
        namespaceName,
      };
    })
    .map((item) => {
      if (!item) {
        return false
      } else {
        if (item.children) {
          const { children: exportSourceFile, ...rest } = item;
          analyzedFiles!.add(exportSourceFile);
          const children = analyzeCallGraph(exportSourceFile, analyzedFiles) as CallGraphNode[];
          return {
            children,
            ...rest
          }
        }
        return item;
      }
    })
    .filter(Boolean) as CallGraphNode[];
};
