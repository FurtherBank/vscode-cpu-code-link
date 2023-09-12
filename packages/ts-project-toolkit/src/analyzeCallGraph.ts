import { ExportItem, ExportType } from "./analyzeExports";

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
 * 根据导出信息获取导出内容类型
 * @param items
 */
export const getAggregateExportType = (
  items: ExportItem[]
): ExportType | "hook" => {
  if (
    items.find(
      (item) => item.name.startsWith("use") && item.exportType !== "class"
    )
  ) {
    return "hook";
  }
  return ["class", "function", "variable"].find((exportType) => {
    return items.find((item) => item.exportType === exportType);
  }) as ExportType;
};
