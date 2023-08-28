import { expect } from 'chai';
import { Project, SourceFile } from 'ts-morph';
import { analyzeImports, ImportInfo } from './analyzeImports';

describe('analyzeImports', () => {
  let project: Project;
  let sourceFile: SourceFile;

  before(() => {
    // 在每个测试之前创建一个新的项目和源文件
    project = new Project();
    sourceFile = project.createSourceFile('testFile.ts', ''); // 使用适当的文件名和内容
  });

  it('should correctly analyze imports', () => {
    // 模拟添加导入声明到源文件
    sourceFile.addImportDeclaration({
      moduleSpecifier: 'my-module',
      defaultImport: 'myDefault',
      namedImports: ['namedImport1', 'namedImport2'],
    });

    const importInfo: ImportInfo[] = analyzeImports(sourceFile);

    const expected: ImportInfo[] = [
      {
        importPath: 'my-module',
        realFilePath: undefined,
        defaultName: 'myDefault',
        namespaceName: undefined,
        namedImports: ['namedImport1', 'namedImport2'],
      },
    ];

    expect(importInfo).to.deep.equal(expected);
  });
});
