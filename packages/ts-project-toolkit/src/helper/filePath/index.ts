import * as path from "path";

// 获取文件拓展名
export function getFileExtension(filePath: string): string {
  return path.extname(filePath);
}

// 获取文件不带拓展名的名称
export function getModuleFileName(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

// 获取文件不带拓展名的名称，如果名称为index，则返回其上一级目录的名称
export function getModuleName(filePath: string): string {
  const fileName = getModuleFileName(filePath);
  if (fileName === "index") {
    return path.basename(path.dirname(filePath));
  }
  return fileName;
}
