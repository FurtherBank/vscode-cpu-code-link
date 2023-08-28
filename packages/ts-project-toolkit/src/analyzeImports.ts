import { SourceFile } from 'ts-morph';

export interface ImportInfo {
  importPath: string;
  realFilePath?: string;
  defaultName?: string;
  namespaceName?: string;
  namedImports: string[];
}

export function analyzeImports(sourceFile: SourceFile): ImportInfo[] {
  const importModules = sourceFile.getImportDeclarations();
  return importModules.map((importDecl) => {
    const realFilePath = importDecl.getModuleSpecifierSourceFile()?.getFilePath();
    return {
      importPath: importDecl.getModuleSpecifierValue(),
      realFilePath,
      defaultName: importDecl.getDefaultImport()?.getText(),
      namespaceName: importDecl.getNamespaceImport()?.getText(),
      namedImports: importDecl.getNamedImports().map((i) => i.getText()),
    };
  });
}
