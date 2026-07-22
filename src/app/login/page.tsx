import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Вход — PeoDesc",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const { callbackUrl } = await searchParams;
  const redirectTo =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-headline-sm text-on-surface">Вход</h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Войдите через Google, чтобы сохранять советы и открывать личный кабинет.
      </p>

      <form
        className="mt-8"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo });
        }}
      >
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3 text-label-lg font-semibold text-on-primary transition hover:opacity-95"
        >
          Войти через Google
        </button>
      </form>

      <p className="mt-6 text-center text-body-sm text-on-surface-variant">
        <Link href="/" className="underline-offset-2 hover:underline">
          На главную
        </Link>
      </p>
    </main>
  );
}
