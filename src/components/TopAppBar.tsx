import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { getOptionalUser } from "@/lib/auth/session";

export async function TopAppBar() {
  const user = await getOptionalUser();
  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-gutter py-base">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-2 transition-colors duration-150 hover:bg-surface-variant/20 active:scale-95"
            aria-label="Назад"
          >
            <MaterialIcon name="arrow_back" className="text-primary" />
          </button>
          <h1 className="font-headline text-headline-lg-mobile font-bold text-primary md:text-headline-md">
            PeoDesc
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            className="rounded-full p-2 transition-colors duration-150 hover:bg-surface-variant/20 active:scale-95"
            aria-label="Поиск"
          >
            <MaterialIcon name="search" className="text-primary" />
          </button>
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full px-3 py-2 font-body text-label-lg font-semibold text-primary transition-colors hover:bg-primary-container/40"
            >
              Кабинет
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full px-3 py-2 font-body text-label-lg font-semibold text-primary transition-colors hover:bg-primary-container/40"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
