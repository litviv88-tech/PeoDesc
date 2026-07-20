import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type NoteRow = {
  id: string;
  title: string;
  createdAt: Date;
};

async function loadNotes(): Promise<
  { ok: true; notes: NoteRow[] } | { ok: false; message: string }
> {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, notes };
  } catch (error) {
    console.error("Failed to load notes:", error);
    const message =
      error instanceof Error ? error.message : "Не удалось подключиться к базе данных.";
    return { ok: false, message };
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function Home() {
  const result = await loadNotes();

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            PeoDesc
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Заметки</h1>
          <p className="text-zinc-600">
            Данные из Neon PostgreSQL через Prisma.
          </p>
        </header>

        {!result.ok ? (
          <div
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            <p className="font-medium">База данных недоступна</p>
            <p className="mt-1 text-amber-800">{result.message}</p>
            <p className="mt-2 text-amber-800">
              Укажите реальный <code className="rounded bg-amber-100 px-1">DATABASE_URL</code>{" "}
              в <code className="rounded bg-amber-100 px-1">.env</code>, затем выполните{" "}
              <code className="rounded bg-amber-100 px-1">npm run db:migrate</code> и{" "}
              <code className="rounded bg-amber-100 px-1">npm run db:seed</code>.
            </p>
          </div>
        ) : result.notes.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-zinc-600">
            Заметок пока нет. Запустите{" "}
            <code className="rounded bg-zinc-100 px-1">npm run db:seed</code>.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            {result.notes.map((note) => (
              <li key={note.id} className="px-5 py-4">
                <p className="font-medium">{note.title}</p>
                <time
                  className="mt-1 block text-sm text-zinc-500"
                  dateTime={note.createdAt.toISOString()}
                >
                  {formatDate(note.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
