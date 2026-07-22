import type { Note } from "@prisma/client";
import { Visibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getNoteForViewer(
  noteId: string,
  viewerUserId: string | null | undefined,
): Promise<Note | null> {
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) return null;
  if (note.visibility === "PUBLIC") return note;
  if (viewerUserId && note.ownerId === viewerUserId) return note;
  return null;
}

export async function listNotesForOwner(ownerId: string) {
  return prisma.note.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });
}

export async function listPublicNotes(limit = 20) {
  return prisma.note.findMany({
    where: { visibility: Visibility.PUBLIC },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { category: true },
  });
}
