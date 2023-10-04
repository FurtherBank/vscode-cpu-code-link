import path from 'path';
import { SourceFile } from 'ts-morph';

export interface ImportInfo {
  /**
   * import 语法所写的路径字符串
   */
  importPath: string;
  /**
   * 导入的真实文件路径
   */
  realFilePath?: string;
  /**
   * 引入的默认导出名称
   */
  defaultName?: string;
  namespaceName?: string;
  namedImports: string[];
}

export function analyzeImports(sourceFile: SourceFile): ImportInfo[] {
  const importModules = sourceFile.getImportDeclarations();
  return importModules.map((importDecl) => {
    const importFilePath = importDecl.getModuleSpecifierSourceFile()?.getFilePath();
    return {
      importPath: importDecl.getModuleSpecifierValue(),
      realFilePath: importFilePath ? path.resolve(importFilePath) : undefined,
      defaultName: importDecl.getDefaultImport()?.getText(),
      namespaceName: importDecl.getNamespaceImport()?.getText(),
      namedImports: importDecl.getNamedImports().map((i) => i.getText()),
    };
  });
}
