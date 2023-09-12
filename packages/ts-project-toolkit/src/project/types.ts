import * as fs from "fs";
import { SourceFile } from "ts-morph";
import { ExportInfo, ExportType } from "../analyzeExports";
import { ImportInfo } from "../analyzeImports";

export interface FileBaseInfo {
  realFilePath: string;
  relativePath: string;
  stat: fs.Stats;
  exportType: ExportType | "hook" | undefined;
}

export interface SourceFileInfo extends FileBaseInfo {
  sourceFile: SourceFile;
  importModules: ImportInfo[];
  exportModules: ExportInfo;
}

export type CallGraphNode = Omit<ImportInfo, "namedImports"> &
  FileBaseInfo & {
    children?: CallGraphNode[];
  };
