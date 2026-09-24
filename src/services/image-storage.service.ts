import { getEnv } from "../config/env.js";

export function resolveImageUrl(value: string): string {
  const source = String(value).trim();
  if (!source || /^https?:\/\//i.test(source)) return source;

  const baseUrl = getEnv().IMAGE_BASE_URL;
  if (!baseUrl) return source;

  return `${baseUrl.replace(/\/$/, "")}/${source.replace(/^\//, "")}`;
}

export function resolveImageUrls(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => resolveImageUrl(String(value)));
}