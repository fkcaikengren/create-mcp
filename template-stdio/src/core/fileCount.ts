import fs from "node:fs";
import path from "node:path";

/**
 * 递归统计目录下的文件数量, 忽略指定目录
 * @param root 根目录
 * @param ignore 忽略的目录名列表
 * @returns 文件数量
 */
export async function countFiles(root: string, ignore: string[] = []): Promise<number> {
  const visited = new Set<string>();
  const ig = new Set(ignore.map(s => s.trim()).filter(Boolean));

  async function walk(dir: string): Promise<number> {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    let count = 0;
    for (const d of dirents) {
      const full = path.join(dir, d.name);
      const rel = path.relative(root, full);
      if (ig.has(d.name) || ig.has(rel)) continue;
      if (d.isDirectory()) {
        count += await walk(full);
      } else if (d.isFile()) {
        if (!visited.has(full)) {
          visited.add(full);
          count += 1;
        }
      }
    }
    return count;
  }

  return walk(root);
}
