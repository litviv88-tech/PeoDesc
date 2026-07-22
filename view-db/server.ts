import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, extname } from "node:path";
import { getDatabaseUrls, maskDatabaseUrl } from "./env";
import {
  type DbTarget,
  createRow,
  deleteRow,
  getClient,
  getColumns,
  getPrimaryKeys,
  getTablePage,
  listTables,
  updateRow,
} from "./db";

const PORT = Number(process.env.VIEW_DB_PORT ?? 3920);
const PUBLIC_DIR = resolve(process.cwd(), "view-db", "public");

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

function getTarget(url: URL): DbTarget {
  const t = url.searchParams.get("target");
  if (t === "work") return "work";
  return "local";
}

function resolveUrl(target: DbTarget) {
  const { local, work } = getDatabaseUrls();
  const url = target === "work" ? work : local;
  if (!url) {
    throw new Error(
      target === "work"
        ? "WORK_DATABASE_URL не задан в .env"
        : "DATABASE_URL не задан в .env",
    );
  }
  return url;
}

function serveStatic(pathname: string, res: ServerResponse) {
  const filePath = resolve(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname.slice(1));
  if (!filePath.startsWith(PUBLIC_DIR) || !existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = extname(filePath);
  const type =
    ext === ".html"
      ? "text/html; charset=utf-8"
      : ext === ".js"
        ? "text/javascript; charset=utf-8"
        : ext === ".css"
          ? "text/css; charset=utf-8"
          : "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  res.end(readFileSync(filePath));
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const pathname = url.pathname;

    if (pathname === "/api/targets" && req.method === "GET") {
      const { local, work } = getDatabaseUrls();
      return sendJson(res, 200, {
        local: { configured: Boolean(local), masked: maskDatabaseUrl(local) },
        work: { configured: Boolean(work), masked: maskDatabaseUrl(work) },
      });
    }

    if (pathname === "/api/tables" && req.method === "GET") {
      const target = getTarget(url);
      const client = getClient(resolveUrl(target));
      const tables = await listTables(client);
      return sendJson(res, 200, { tables });
    }

    const tableMatch = pathname.match(/^\/api\/tables\/([^/]+)$/);
    if (tableMatch && req.method === "GET") {
      const table = decodeURIComponent(tableMatch[1]);
      const target = getTarget(url);
      const page = Number(url.searchParams.get("page") ?? "1");
      const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
      const client = getClient(resolveUrl(target));
      const [data, columns, primaryKeys] = await Promise.all([
        getTablePage(client, table, page, pageSize),
        getColumns(client, table),
        getPrimaryKeys(client, table),
      ]);
      return sendJson(res, 200, { table, columns, primaryKeys, ...data });
    }

    if (tableMatch && req.method === "POST") {
      const table = decodeURIComponent(tableMatch[1]);
      const target = getTarget(url);
      const body = await readBody(req);
      const client = getClient(resolveUrl(target));
      await createRow(client, table, body);
      return sendJson(res, 201, { ok: true });
    }

    if (tableMatch && req.method === "PUT") {
      const table = decodeURIComponent(tableMatch[1]);
      const target = getTarget(url);
      const body = await readBody(req);
      const keys = (body.keys ?? {}) as Record<string, unknown>;
      const values = (body.values ?? {}) as Record<string, unknown>;
      const client = getClient(resolveUrl(target));
      await updateRow(client, table, keys, values);
      return sendJson(res, 200, { ok: true });
    }

    if (tableMatch && req.method === "DELETE") {
      const table = decodeURIComponent(tableMatch[1]);
      const target = getTarget(url);
      const body = await readBody(req);
      const keys = (body.keys ?? {}) as Record<string, unknown>;
      const client = getClient(resolveUrl(target));
      await deleteRow(client, table, keys);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "GET") {
      return serveStatic(pathname, res);
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    sendJson(res, 400, { error: message });
  }
});

server.listen(PORT, () => {
  console.log(`view-db: http://localhost:${PORT}`);
  const { local, work } = getDatabaseUrls();
  console.log(`  local: ${local ? maskDatabaseUrl(local) : "не задан DATABASE_URL"}`);
  console.log(`  work:  ${work ? maskDatabaseUrl(work) : "не задан WORK_DATABASE_URL"}`);
});
