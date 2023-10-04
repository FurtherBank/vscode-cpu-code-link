import * as fs from "fs";
import { SourceFile } from "ts-morph";
import { ExportInfo } from "../analyzeExports";
import { ImportInfo } from "../analyzeImports";

export type ModuleType = "external" | "hook" | "class" | "jsx" | "js";

/**
 * 代码模块文件的基本信息
 * 相比`SourceFileInfo`，不包含`SourceFile`，`importModules`和`exportModules`
 * 其它属性都是一致的，透传即可
 */
export interface FileBaseInfo {
  realFilePath?: string;
  /**
   * 相对于项目根目录(`tsconfig.json`所在目录)的路径
   */
  relativePath?: string;
  stat?: fs.Stats;
  /**
   * 根据导出信息确定的模块类型
   */
  moduleType?: ModuleType;
  /**
   * 模块的名称，仅内部模块具有
   */
  moduleName?: string;
  /**
   * 模块文件不带拓展名的名称，仅内部模块具有
   */
  moduleFileName?: string;
}

export interface SourceFileInfo {
  /**
   * 代码模块文件的基本信息，注意，相同文件不同节点的`baseInfo`引用相同
   */
  baseInfo: FileBaseInfo;
  sourceFile: SourceFile;
  importModules: ImportInfo[];
  exportModules: ExportInfo;
}

export type CallGraphNode = Omit<
  ImportInfo,
  "namedImports" | "realFilePath"
> & {
  baseInfo: FileBaseInfo;
  children?: CallGraphNode[];
};
