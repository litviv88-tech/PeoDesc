-- Объединение Note и Sovet в одну таблицу Note (данные из Sovet).

INSERT INTO "Sovet" (
  "id",
  "ownerId",
  "title",
  "content",
  "description",
  "categoryId",
  "visibility",
  "createdAt",
  "updatedAt",
  "publishedAt"
)
SELECT
  'm' || substr(md5(n."id"::text), 1, 24),
  n."ownerId",
  n."title",
  n."title",
  NULL,
  c."id",
  'PRIVATE'::"Visibility",
  n."createdAt",
  n."createdAt",
  NULL
FROM "Note" AS n
CROSS JOIN LATERAL (
  SELECT "id"
  FROM "Category"
  ORDER BY "category"
  LIMIT 1
) AS c
WHERE NOT EXISTS (
  SELECT 1
  FROM "Sovet" AS s
  WHERE s."ownerId" = n."ownerId" AND s."title" = n."title"
);

DROP TABLE "Note";

ALTER TABLE "Sovet" RENAME TO "Note";

ALTER TABLE "SovetTag" RENAME TO "NoteTag";
ALTER TABLE "NoteTag" RENAME COLUMN "sovetId" TO "noteId";

ALTER TABLE "Vote" RENAME COLUMN "sovetId" TO "noteId";
