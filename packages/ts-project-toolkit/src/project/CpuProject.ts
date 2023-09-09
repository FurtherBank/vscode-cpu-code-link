import * as fs from "fs";
import { Project, SourceFile } from "ts-morph";
import {
  ExportInfo,
  ExportItem,
  ExportType,
  analyzeExports,
} from "../analyzeExports";
import { ImportInfo, analyzeImports } from "../analyzeImports";
import {
  CallGraphNode,
  getAggregateExportType,
  isInternalCodeModule,
} from "../analyzeCallGraph";
import path from "path";

interface SourceFileInfo {
  realFilePath: string;
  sourceFile: SourceFile;
  importModules: ImportInfo[];
  exportModules: ExportInfo;
  stat: fs.Stats;
  exportType?: "hook" | ExportType;
}

interface SourceFilesInfoMap {
  [realFilePath: string]: SourceFileInfo;
}

export class CpuProject {
  constructor(
    public tsConfigFilePath: string,
    public project: Project,
    public sourceFilesInfoMap: SourceFilesInfoMap
  ) {
    this.tsConfigFilePath = tsConfigFilePath;
    this.project = project;
    this.sourceFilesInfoMap = sourceFilesInfoMap;
  }

  static async create(tsConfigFilePath: string) {
    console.time(`📂 create project: ${tsConfigFilePath}`);
    const project = new Project({
      tsConfigFilePath,
    });
    const sourceFiles = project.getSourceFiles();
    const sourceFilesInfoMap = {} as CpuProject["sourceFilesInfoMap"];
    await Promise.all(
      sourceFiles.map(async (sourceFile) => {
        // 这里 path 需要转化为 fs 格式的路径，否则会出现路径不一致的问题
        const realFilePath = path.resolve(sourceFile.getFilePath());
        const importModules = analyzeImports(sourceFile);
        const exportModules = analyzeExports(sourceFile);
        const stat = await fs.promises.stat(realFilePath);

        const { defaultExport, namedExports } = exportModules;
        sourceFilesInfoMap[realFilePath] = {
          realFilePath,
          sourceFile,
          importModules,
          exportModules,
          stat,
          exportType: getAggregateExportType(
            defaultExport ? namedExports.concat([defaultExport]) : namedExports
          ),
        };
      })
    );
    console.timeEnd(`📂 create project: ${tsConfigFilePath}`);
    console.log(` - with ${Object.keys(sourceFilesInfoMap).length} files`);
    // console.log(Object.keys(sourceFilesInfoMap));

    return new CpuProject(tsConfigFilePath, project, sourceFilesInfoMap);
  }

  getFileBaseInfo(filePath: string) {
    const sourceFileInfo = this.sourceFilesInfoMap[filePath];
    if (!sourceFileInfo) throw new Error(`[error] file not found: ${filePath}`);
    const { realFilePath, stat, exportType } = sourceFileInfo;
    return {
      realFilePath,
      stat,
      exportType,
    };
  }

  /**
   * 获取引用关系图
   * @param filePath
   * @returns
   */
  getRefGraph(filePath: string) {
    const sourceFileInfo = this.getFileBaseInfo(filePath);
    return {
      ...sourceFileInfo,
      importPath: path.basename(filePath, path.extname(filePath)),
      children: this.analyzeCallGraphChildren(filePath) as CallGraphNode[],
    };
  }

  private analyzeCallGraphChildren(
    sourceFilePath: string,
    analyzedFiles: Set<string> = new Set<string>()
  ): CallGraphNode[] {
    // 1. 防止循环引用
    if (analyzedFiles!.has(sourceFilePath)) {
      return [];
    }
    analyzedFiles!.add(sourceFilePath);

    // 2. 分析 import
    const sourceFileInfo = this.sourceFilesInfoMap[sourceFilePath];
    const { importModules } = sourceFileInfo;

    // 3. 层次遍历分析 export 内容
    return importModules
      .map((importModuleInfo) => {
        const {
          realFilePath,
          importPath,
          defaultName,
          namespaceName,
          namedImports,
        } = importModuleInfo;

        if (isInternalCodeModule(realFilePath)) {
          const exportSourceFileInfo = this.sourceFilesInfoMap[realFilePath!];
          if (exportSourceFileInfo) {
            const {
              exportModules: { defaultExport, namedExports },
              stat,
              exportType,
            } = exportSourceFileInfo;
            console.log(`[info] exports of ${importPath}`, {
              defaultExport,
              namedExports,
            });

            // 根据文件导出信息完善 import 信息
            const importedItems = namedImports
              .map((name) => {
                return namedExports.find((item) => item.name === name);
              })
              .filter(Boolean) as ExportItem[];
            if (defaultName && defaultExport) {
              importedItems.push(defaultExport);
            }

            // 只采集非 type only 的导入文件
            const onlyTypeImports = importedItems.every(
              (item) => item.isTypeOnly
            );
            if (!onlyTypeImports) {
              return {
                realFilePath,
                importPath,
                defaultName,
                namespaceName,
                exportType,
                stat,
                // children 在下一个 map 中计算，从而实现层次遍历，解决文件重叠在浅层的问题
                children: realFilePath,
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
          return false;
        } else {
          if (item.children) {
            const { children: realFilePath } = item;
            const children = this.analyzeCallGraphChildren(
              realFilePath,
              analyzedFiles
            );
            return {
              ...item,
              children,
            };
          }
          return item;
        }
      })
      .filter(Boolean) as CallGraphNode[];
  }
}