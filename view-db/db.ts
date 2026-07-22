import { PrismaClient } from "@prisma/client";

export type DbTarget = "local" | "work";

const clients = new Map<string, PrismaClient>();

export function getClient(url: string) {
  let client = clients.get(url);
  if (!client) {
    client = new PrismaClient({
      datasources: { db: { url } },
      log: ["error"],
    });
    clients.set(url, client);
  }
  return client;
}

function assertSafeIdentifier(name: string, kind: "table" | "column") {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Недопустимое имя ${kind}: ${name}`);
  }
}

export async function listTables(client: PrismaClient) {
  const rows = await client.$queryRaw<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name`;
  return rows.map((r) => r.table_name);
}

export async function getColumns(client: PrismaClient, table: string) {
  assertSafeIdentifier(table, "table");
  return client.$queryRaw<
    {
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }[]
  >`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table}
    ORDER BY ordinal_position`;
}

export async function getPrimaryKeys(client: PrismaClient, table: string) {
  assertSafeIdentifier(table, "table");
  const rows = await client.$queryRaw<{ column_name: string }[]>`
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = ${table}
      AND tc.constraint_type = 'PRIMARY KEY'
    ORDER BY kcu.ordinal_position`;
  return rows.map((r) => r.column_name);
}

export async function getTablePage(
  client: PrismaClient,
  table: string,
  page: number,
  pageSize: number,
) {
  assertSafeIdentifier(table, "table");
  const safePage = Math.max(1, page);
  const safeSize = Math.min(100, Math.max(1, pageSize));
  const offset = (safePage - 1) * safeSize;

  const countRows = await client.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count FROM "${table}"`,
  );
  const total = Number(countRows[0]?.count ?? 0);

  const rows = await client.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT * FROM "${table}" ORDER BY 1 LIMIT ${safeSize} OFFSET ${offset}`,
  );

  return {
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeSize)),
    rows: rows.map(serializeRow),
  };
}

function serializeRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === "bigint") {
      out[key] = value.toString();
    } else if (value instanceof Date) {
      out[key] = value.toISOString();
    } else {
      out[key] = value;
    }
  }
  return out;
}

function parseCell(value: unknown, dataType: string) {
  if (value === null || value === "") return null;
  if (typeof value === "string") {
    const v = value.trim();
    if (v === "null") return null;
    if (
      dataType.includes("int") ||
      dataType === "numeric" ||
      dataType === "double precision" ||
      dataType === "real"
    ) {
      return Number(v);
    }
    if (dataType === "boolean") {
      return v === "true" || v === "1";
    }
    return v;
  }
  return value;
}

export async function createRow(
  client: PrismaClient,
  table: string,
  payload: Record<string, unknown>,
) {
  assertSafeIdentifier(table, "table");
  const columns = await getColumns(client, table);
  const colMap = new Map(columns.map((c) => [c.column_name, c.data_type]));
  const entries = Object.entries(payload).filter(([k, v]) => {
    assertSafeIdentifier(k, "column");
    return colMap.has(k) && v !== undefined;
  });
  if (entries.length === 0) throw new Error("Нет полей для вставки");

  const names = entries.map(([k]) => `"${k}"`).join(", ");
  const placeholders = entries.map((_, i) => `$${i + 1}`).join(", ");
  const values = entries.map(([k, v]) => parseCell(v, colMap.get(k) ?? "text"));

  await client.$executeRawUnsafe(
    `INSERT INTO "${table}" (${names}) VALUES (${placeholders})`,
    ...values,
  );
}

export async function updateRow(
  client: PrismaClient,
  table: string,
  keys: Record<string, unknown>,
  payload: Record<string, unknown>,
) {
  assertSafeIdentifier(table, "table");
  const columns = await getColumns(client, table);
  const colMap = new Map(columns.map((c) => [c.column_name, c.data_type]));
  const pk = await getPrimaryKeys(client, table);
  if (pk.length === 0) throw new Error("У таблицы нет первичного ключа");

  const setEntries = Object.entries(payload).filter(([k, v]) => {
    assertSafeIdentifier(k, "column");
    return colMap.has(k) && !pk.includes(k) && v !== undefined;
  });
  if (setEntries.length === 0) throw new Error("Нет полей для обновления");

  const whereEntries = pk.map((k) => {
    if (keys[k] === undefined) throw new Error(`Не указан ключ ${k}`);
    return [k, keys[k]] as const;
  });

  let param = 1;
  const setSql = setEntries
    .map(([k]) => {
      const p = `$${param++}`;
      return `"${k}" = ${p}`;
    })
    .join(", ");
  const whereSql = whereEntries
    .map(([k]) => {
      const p = `$${param++}`;
      return `"${k}" = ${p}`;
    })
    .join(" AND ");

  const values = [
    ...setEntries.map(([k, v]) => parseCell(v, colMap.get(k) ?? "text")),
    ...whereEntries.map(([, v]) => v),
  ];

  const result = await client.$executeRawUnsafe(
    `UPDATE "${table}" SET ${setSql} WHERE ${whereSql}`,
    ...values,
  );
  return result;
}

export async function deleteRow(client: PrismaClient, table: string, keys: Record<string, unknown>) {
  assertSafeIdentifier(table, "table");
  const pk = await getPrimaryKeys(client, table);
  if (pk.length === 0) throw new Error("У таблицы нет первичного ключа");

  const whereEntries = pk.map((k) => {
    if (keys[k] === undefined) throw new Error(`Не указан ключ ${k}`);
    assertSafeIdentifier(k, "column");
    return [k, keys[k]] as const;
  });

  const whereSql = whereEntries.map(([k], i) => `"${k}" = $${i + 1}`).join(" AND ");
  const values = whereEntries.map(([, v]) => v);
  await client.$executeRawUnsafe(`DELETE FROM "${table}" WHERE ${whereSql}`, ...values);
}
