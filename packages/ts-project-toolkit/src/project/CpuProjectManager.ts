import { CpuProject } from "./CpuProject";

export class CpuProjectManager {
  public static projectMap: Map<string, CpuProject> = new Map();
  public static async getProject(tsConfigFilePath: string) {
    if (!this.projectMap.has(tsConfigFilePath)) {
      const project = await CpuProject.create(tsConfigFilePath);

      this.projectMap.set(tsConfigFilePath, project);
    }
    return this.projectMap.get(tsConfigFilePath)!;
  }
}


