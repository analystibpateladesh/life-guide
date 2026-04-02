"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/actions";

export type HeaderUser = {
  displayName: string;
  email: string;
};

function SearchField() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  return (
    <input
      key={q}
      type="search"
      name="q"
      placeholder="Search Daily Guide"
      defaultValue={q}
      className="w-full max-w-2xl rounded-full border border-[var(--guide-border)] bg-[var(--guide-input)] px-4 py-2 pl-10 text-sm text-[var(--guide-text)] placeholder:text-[var(--guide-muted)] focus:border-[var(--guide-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--guide-accent)]"
    />
  );
}

function SearchShell({ children }: { children: React.ReactNode }) {
  return (
    <form action="/" method="get" className="relative min-w-0 flex-1">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--guide-muted)]" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      </span>
      {children}
    </form>
  );
}

export function Header({ user }: { user: HeaderUser | null }) {
  const createHref = user ? "/new" : "/login?next=/new";

  return (
    <header className="z-30 shrink-0 border-b border-[var(--guide-border)] bg-[var(--guide-header)]">
      <div className="flex items-center gap-2 px-3 py-2 md:gap-3 md:pl-4">
        <Link
          href="/"
          className="shrink-0 text-base font-extrabold tracking-tight text-[var(--guide-text)] md:text-lg"
        >
          <span className="text-[var(--guide-accent)]">Daily</span>
          <span className="hidden sm:inline"> Guide</span>
        </Link>
        <SearchShell>
          <Suspense
            fallback={
              <input
                type="search"
                name="q"
                placeholder="Search..."
                className="w-full max-w-2xl rounded-full border border-[var(--guide-border)] bg-[var(--guide-input)] px-4 py-2 pl-10 text-sm"
              />
            }
          >
            <SearchField />
          </Suspense>
        </SearchShell>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <span className="hidden max-w-[120px] truncate text-xs font-medium text-[var(--guide-muted)] md:inline">
                {user.displayName}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--guide-border)] px-3 py-1.5 text-xs font-bold text-[var(--guide-text)] hover:bg-[var(--guide-hover)]"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[var(--guide-border)] px-3 py-1.5 text-xs font-bold text-[var(--guide-text)] hover:bg-[var(--guide-hover)]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-full border border-[var(--guide-accent)] px-3 py-1.5 text-xs font-bold text-[var(--guide-accent)] sm:inline-block"
              >
                Sign up
              </Link>
            </>
          )}
          <Link
            href={createHref}
            className="hidden rounded-full bg-[var(--guide-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--guide-accent-hover)] sm:inline-block"
          >
            Create
          </Link>
          <Link
            href={createHref}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--guide-accent)] text-lg font-bold text-white sm:hidden"
            aria-label="Create post"
          >
            +
          </Link>
        </div>
      </div>
    </header>
  );
}