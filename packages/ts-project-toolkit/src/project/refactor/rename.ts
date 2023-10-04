import fs from "fs";
import { CpuProject } from "../CpuProject";
import path from "path";
import { fileExists } from "../../utils/fs";

export const refactorToIndex = async (p: CpuProject, filePath: string) => {
  // 获取新的文件路径
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  const newDir = path.join(path.dirname(filePath), baseName);
  const newPath = path.join(newDir, `index${ext}`);

  // 创建新的目录（如果不存在）
  const newDirExists = await fileExists(newDir);
  if (!newDirExists) {
    await fs.promises.mkdir(newDir);
  }

  // 移动文件
  const sourceFile = p.project.getSourceFile(filePath);
  sourceFile!.move(newPath);
  await sourceFile!.save();

  // 重置 project 的文件索引
  delete p.sourceFilesInfoMap[filePath];
  p.sourceFilesInfoMap[newPath] = await CpuProject.getSourceFileInfo(
    p.tsConfigFilePath,
    sourceFile!
  );

  return newPath;
};

/**
 * 将index.tsx重命名为目录模块名
 * @param p
 * @param path
 */
export const refactorRestore = async (p: CpuProject, filePath: string) => {
  // 获取新的文件路径
  const dirName = path.dirname(filePath);
  const ext = path.extname(filePath);
  const newPath = path.join(dirName, `../${path.basename(dirName)}${ext}`);

  // 检查目标文件是否已存在
  const targetFile = await fileExists(newPath);
  if (targetFile) {
    throw new Error(`File ${newPath} already exists.`);
  }

  console.log(`move ${filePath} to ${newPath} start`);
  // 移动文件
  const sourceFile = p.project.getSourceFile(filePath);
  sourceFile!.move(newPath);
  await sourceFile!.save();

  console.log(`move ${filePath} to ${newPath}`);

  // 重置 project 的文件索引
  delete p.sourceFilesInfoMap[filePath];
  p.sourceFilesInfoMap[newPath] = await CpuProject.getSourceFileInfo(
    p.tsConfigFilePath,
    sourceFile!
  );

  // 删除原目录（如果为空）
  const dir = await fs.promises.readdir(dirName);
  if (dir.length === 0) {
    await fs.promises.rmdir(dirName);
  }

  return newPath;
};
