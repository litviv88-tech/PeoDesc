import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listNotesForOwner } from "@/lib/notes/access";

export const metadata = {
  title: "Мои советы — PeoDesc",
};

export default async function MyPromptsPage() {
  const user = await requireUser();
  const notes = await listNotesForOwner(user.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-headline-sm text-on-surface">
          Мои советы
        </h1>
        <Link
          href="/dashboard"
          className="text-body-sm text-primary underline-offset-2 hover:underline"
        >
          Кабинет
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="mt-6 text-body-md text-on-surface-variant">
          Пока нет сохранённых советов.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-title-md font-semibold text-on-surface">
                  {note.title}
                </h2>
                <span
                  className={
                    note.visibility === "PUBLIC"
                      ? "rounded-full bg-tertiary-container px-2 py-0.5 text-label-sm text-on-tertiary-container"
                      : "rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant"
                  }
                >
                  {note.visibility === "PUBLIC" ? "Публичный" : "Приватный"}
                </span>
              </div>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                {note.category.category}
              </p>
              <p className="mt-2 line-clamp-2 text-body-md text-on-surface">
                {note.description ?? note.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
