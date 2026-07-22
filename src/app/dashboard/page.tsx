import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/auth/session";

export const metadata = {
  title: "Личный кабинет — PeoDesc",
};

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-headline-sm text-on-surface">
        Личный кабинет
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Вы вошли как{" "}
        <span className="font-medium text-on-surface">{user.email}</span>
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-label-lg font-semibold text-on-primary-container">
            {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-label-lg font-semibold text-on-surface">
            {user.name ?? "Без имени"}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            userId: <code className="text-xs">{user.id}</code>
          </p>
        </div>
      </div>

      <nav className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/my-prompts"
          className="rounded-xl bg-primary px-4 py-2 text-label-lg font-semibold text-on-primary"
        >
          Мои советы
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-outline px-4 py-2 text-label-lg text-on-surface"
        >
          Главная
        </Link>
      </nav>

      <form
        className="mt-8"
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="text-body-md text-error underline-offset-2 hover:underline"
        >
          Выйти
        </button>
      </form>
    </main>
  );
}
