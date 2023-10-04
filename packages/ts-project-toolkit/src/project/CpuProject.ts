import * as fs from "fs";
import { Project, SourceFile } from "ts-morph";
import { ExportItem, analyzeExports } from "../analyzeExports";
import { analyzeImports } from "../analyzeImports";
import { getModuleType, isInternalCodeModule } from "../analyzeCallGraph";
import path from "path";
import { CallGraphNode, SourceFileInfo } from "./types";
import { getModuleFileName, getModuleName } from "../helper/filePath";

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

        sourceFilesInfoMap[realFilePath] = await CpuProject.getSourceFileInfo(
          tsConfigFilePath,
          sourceFile
        );
      })
    );
    console.timeEnd(`📂 create project: ${tsConfigFilePath}`);
    console.log(` - with ${Object.keys(sourceFilesInfoMap).length} files`);
    // console.log(Object.keys(sourceFilesInfoMap));

    return new CpuProject(tsConfigFilePath, project, sourceFilesInfoMap);
  }

  static async getSourceFileInfo(
    tsConfigFilePath: string,
    sourceFile: SourceFile
  ): Promise<SourceFileInfo> {
    const projectPath = path.dirname(tsConfigFilePath);
    // 这里 path 需要转化为 fs 格式的路径，否则会出现路径不一致的问题
    const realFilePath = path.resolve(sourceFile.getFilePath());
    const relativePath = path.relative(projectPath, realFilePath);
    const stat = await fs.promises.stat(realFilePath);
    const importModules = analyzeImports(sourceFile);
    const exportModules = analyzeExports(sourceFile);

    return {
      baseInfo: {
        realFilePath,
        relativePath,
        stat,
        moduleType: getModuleType(realFilePath, exportModules),
        moduleName: getModuleName(realFilePath),
        moduleFileName: getModuleFileName(realFilePath),
      },
      importModules,
      exportModules,
      sourceFile,
    };
  }
  /**
   * 获取引用关系图
   * @param filePath
   * @returns
   */
  getRefGraph(filePath: string) {
    const { baseInfo } = this.sourceFilesInfoMap[filePath];
    return {
      baseInfo,
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
              baseInfo,
            } = exportSourceFileInfo;

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
                baseInfo,
                importPath,
                defaultName,
                namespaceName,
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
          baseInfo: {
            realFilePath,
            moduleType: "external",
          },
          importPath,
          defaultName,
          namespaceName,
          children: undefined,
        };
      })
      .map((item) => {
        if (item) {
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
        return false;
      })
      .filter(Boolean) as CallGraphNode[];
  }

  get projectPath() {
    return path.dirname(this.tsConfigFilePath);
  }
}
