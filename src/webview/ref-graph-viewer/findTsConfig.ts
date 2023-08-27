import fs from 'fs/promises';
import path from 'path';

export async function findTsConfig(filePath: string): Promise<string> {
  const currentDir = path.dirname(filePath);

  try {
    const tsConfigPath = path.join(currentDir, 'tsconfig.json');
    console.log('try to access tsConfigPath', tsConfigPath);
    await fs.access(tsConfigPath);
    return tsConfigPath;
  } catch (error) {
    // If tsconfig.json not found in the current directory, move up one level
    const parentDir = path.dirname(currentDir);

    // Check if we've reached the root directory
    if (parentDir === currentDir) {
      throw new Error(`tsconfig.json not found from ${filePath}`);
    }

    // Recursively search in the parent directory
    return findTsConfig(parentDir);
  }
}
