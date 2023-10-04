import { ExportInfo, ExportItem } from "./analyzeExports";
import { ModuleType } from "./project/types";

const CodeExtension = [".ts", ".tsx", ".js", ".jsx"];

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
  if (!realFilePath || realFilePath?.includes("node_modules")) return false;
  return CodeExtension.some((ext) => realFilePath.endsWith(ext));
};

/**
 * 根据导出信息确定模块类型
 * @param items
 */
export const getModuleType = (
  realFilePath: string | undefined,
  exportInfo: ExportInfo
): ModuleType => {
  const ext = realFilePath?.split(".").pop() ?? "";
  const items = [exportInfo.defaultExport, ...exportInfo.namedExports].filter(
    Boolean
  ) as ExportItem[];
  if (!isInternalCodeModule(realFilePath)) return "external";
  if (
    items.find(
      (item) => item.name.startsWith("use") && item.exportType !== "class"
    )
  ) {
    return "hook";
  }
  if (["tsx", "jsx"].includes(ext)) return "jsx";
  if (items.find((item) => item.exportType === "class")) return "class";
  if (["ts", "js"].includes(ext)) return "js";

  return "external";
};
