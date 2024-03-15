import { readFile as fsReadFile, stat, readdir } from "fs/promises";
import { join } from 'path';

export async function getFile(filepath: string): Promise<string> | null {
  try {
    const content = await fsReadFile(filepath, "utf8");
    return content.toString();
  } catch (e) {
    console.error("gat ekki lesið skránna: ", e);
    return null;
  }
}

export async function readFilesFromDir(dir: string): Promise<string[]> {
  let files = [];
  try {
    files = await readdir(dir);
  } catch (e) {
    return [];
  }

  const mapped = files.map(async (file) => {
    const path = join(dir, file);
    const info = await stat(path);

    if (info.isDirectory()) {
      return null;
    }

    return path;
  });

  const resolved = await Promise.all(mapped);

  // Remove any directories that will be represented by `null`
  const filtered = [];
  for (const file of resolved) {
    if (file) {
      filtered.push(file);
    }
  }

  return filtered;
}
