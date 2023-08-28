import { SourceFile } from 'ts-morph';

interface ExportItem {
  name: string;
  isTypeOnly: boolean;
}

export interface ExportInfo {
  defaultExport?: ExportItem;
  namedExports: ExportItem[];
}

export function analyzeExports(sourceFile: SourceFile): ExportInfo {
  let defaultExport: ExportItem | undefined;
  const namedExports: ExportItem[] = [];
  // export functions
  sourceFile
    .getFunctions()
    .filter((f) => f.isExported())
    .forEach((f) => {
      const item = {
        name: f.getName() ?? '',
        isTypeOnly: false,
      };
      if (f.isDefaultExport()) {
        defaultExport = item;
      } else {
        namedExports.push(item);
      }
    });
  // export variables
  sourceFile
    .getVariableDeclarations()
    .filter((v) => v.isExported())
    .forEach((v) => {
      const item = {
        name: v.getName() ?? '',
        isTypeOnly: false,
      };
      if (v.isDefaultExport()) {
        defaultExport = item;
      } else {
        namedExports.push(item);
      }
    });
  // app exports
  const exportModules = sourceFile.getExportDeclarations();
  const exportModulesInfo = exportModules.flatMap((exportDeclaration) => {
    const exportedSymbols = exportDeclaration.getNamedExports(); // 获取导出的符号
    return exportedSymbols.map((specifier) => {
      console.log('Exported symbol name:', specifier.getName()); // 打印导出的符号名称
      console.log('Symbol kind:', specifier.getKindName()); // 打印符号的类型（类、函数、变量等）
      return {
        name: specifier.getName(),
        isTypeOnly: specifier.isTypeOnly(),
      };
    });
  });
  return {
    defaultExport,
    namedExports: namedExports.concat(exportModulesInfo),
  };
}