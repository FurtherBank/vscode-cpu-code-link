import fs from 'fs';
import { SourceFile } from 'ts-morph';
import { ImportInfo, analyzeImports } from './analyzeImports';
import { analyzeExports } from './analyzeExports';

export type CallGraphNode = Omit<ImportInfo, 'namedImports'> & {
  stat?: fs.Stats;
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
export function analyzeCallGraph (sourceFile: SourceFile): CallGraphNode[]
export function analyzeCallGraph (sourceFile: SourceFile, analyzedFiles: Set<string>): CallGraphNode[]
export function analyzeCallGraph (sourceFile: SourceFile, analyzedFiles?: Set<string>) {
  // 1. 防止循环引用
  if (!analyzedFiles) {
    analyzedFiles = new Set();
  }
  if (analyzedFiles!.has(sourceFile.getFilePath())) {
    return [];
  }
  analyzedFiles!.add(sourceFile.getFilePath());

  // 2. 分析 import
  const importModulesInfo = analyzeImports(sourceFile);
  console.log(`[info] imports of ${sourceFile.getFilePath()}`, importModulesInfo);

  // 3. 层次遍历分析 export 内容
  return importModulesInfo
    .map((importModuleInfo) => {
      const { realFilePath, importPath, defaultName, namespaceName, namedImports } = importModuleInfo;
      
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
            const stat = fs.statSync(realFilePath!);
            return {
              realFilePath,
              importPath,
              defaultName,
              namespaceName,
              stat,
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
          const children = analyzeCallGraph(exportSourceFile, analyzedFiles!);
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
