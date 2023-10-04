import fs from 'fs'

export const fileExists = async (path: string) => {
  try {
    await fs.promises.access(path)
    return true
  } catch (error) {
    return false
  }
}