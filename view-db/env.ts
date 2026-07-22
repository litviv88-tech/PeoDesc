import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(path: string) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const root = resolve(process.cwd());
loadDotEnv(resolve(root, ".env"));
loadDotEnv(resolve(root, ".env.local"));

export function getDatabaseUrls() {
  const local = process.env.DATABASE_URL ?? "";
  const work = process.env.WORK_DATABASE_URL ?? process.env.DATABASE_URL_WORK ?? "";
  return { local, work };
}

export function maskDatabaseUrl(url: string) {
  if (!url) return "";
  try {
    const normalized = url.replace(/^postgresql:/, "http:");
    const parsed = new URL(normalized);
    const user = parsed.username || "user";
    const host = parsed.hostname;
    const db = parsed.pathname.replace(/^\//, "").split("?")[0] || "db";
    return `postgresql://${user}:***@${host}/${db}`;
  } catch {
    return "postgresql://***";
  }
}
