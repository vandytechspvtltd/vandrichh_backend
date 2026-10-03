import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.resolve(process.cwd(), "src", "data");

export async function readData<T = Record<string, unknown>>(
  collection: string
): Promise<T[]> {
  await mkdir(dataDirectory, { recursive: true });
  const filePath = path.join(dataDirectory, `${collection}.json`);

  try {
    const content = await readFile(filePath, "utf8");
    const data: unknown = JSON.parse(content);
    if (!Array.isArray(data)) {
      throw new Error(`JSON collection ${collection} must contain an array`);
    }
    return data as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await writeFile(filePath, "[]\n", "utf8");
    return [];
  }
}

export async function writeData<T>(collection: string, data: T[]): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });
  const filePath = path.join(dataDirectory, `${collection}.json`);
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function generateId(
  collection: string,
  prefix: string
): Promise<string> {
  const records = await readData<{ _id?: string }>(collection);
  const pattern = new RegExp(`^${prefix}_(\\d+)$`);
  const highest = records.reduce((max, record) => {
    const match = record._id?.match(pattern);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}_${String(highest + 1).padStart(3, "0")}`;
}