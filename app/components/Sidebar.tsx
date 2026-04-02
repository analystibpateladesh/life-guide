"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleCommunityMembership } from "@/app/actions";
import type { Community } from "@/lib/types";

function NavRow({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
        (active
          ? "bg-[var(--guide-hover)] text-[var(--guide-text)]"
          : "text-[var(--guide-muted)] hover:bg-[var(--guide-hover)] hover:text-[var(--guide-text)]")
      }
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--guide-chip)] text-[var(--guide-text)]">
        {icon}
      </span>
      {label}
    </Link>
  );
}

export function Sidebar({
  communities,
  joinedCommunityIds,
  isLoggedIn,
}: {
  communities: Community[];
  joinedCommunityIds: string[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const joined = new Set(joinedCommunityIds);

  function onToggle(communityId: string) {
    if (!isLoggedIn) {
      router.push(`/login?next=/explore`);
      return;
    }
    startTransition(() => {
      void (async () => {
        await toggleCommunityMembership(communityId);
        router.refresh();
      })();
    });
  }

  const joinedList = communities.filter((c) => joined.has(c.id));
  const byName = [...communities].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <aside className="hidden w-[var(--sidebar-width)] shrink-0 flex-col gap-1 overflow-y-auto border-r border-[var(--guide-border)] bg-[var(--guide-header)] py-3 pl-2 pr-1 md:flex">
      <div className="space-y-1 px-1">
        <NavRow
          href="/"
          label="Home"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          }
        />
        <NavRow
          href="/popular"
          label="Popular"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
          }
        />
        <NavRow
          href="/explore"
          label="Explore"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          }
        />
        <NavRow
          href="/news"
          label="News"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
            </svg>
          }
        />
      </div>

      <div className="mx-2 my-3 h-px bg-[var(--guide-border)]" />

      <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--guide-muted)]">
        Your communities
      </div>
      <div className="max-h-40 space-y-0.5 overflow-y-auto px-1">
        {!isLoggedIn ? (
          <p className="px-3 py-2 text-xs text-[var(--guide-muted)]">
            <Link href="/login" className="font-semibold text-[var(--guide-accent)] hover:underline">
              Sign in
            </Link>{" "}
            to save shortcuts here.
          </p>
        ) : joinedList.length === 0 ? (
          <p className="px-3 py-2 text-xs text-[var(--guide-muted)]">
            Join communities below for quick access.
          </p>
        ) : (
          joinedList.map((c) => (
            <Link
              key={c.id}
              href={`/c/${c.slug}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--guide-text)] hover:bg-[var(--guide-hover)]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--guide-accent)] text-xs font-bold text-white">
                {c.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="truncate">g/{c.slug}</span>
            </Link>
          ))
        )}
      </div>

      <div className="mx-2 my-3 h-px bg-[var(--guide-border)]" />

      <div className="flex items-center justify-between px-2 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--guide-muted)]">
          All communities
        </span>
        <Link
          href="/explore"
          className="text-[10px] font-semibold text-[var(--guide-accent)] hover:underline"
        >
          Manage
        </Link>
      </div>
      <div className="space-y-1 overflow-y-auto px-1 pb-4">
        {byName.map((c) => {
          const isJoined = joined.has(c.id);
          return (
            <div
              key={c.id}
              className="flex items-center gap-1 rounded-lg hover:bg-[var(--guide-hover)]"
            >
              <Link
                href={`/c/${c.slug}`}
                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm text-[var(--guide-text)]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--guide-chip)] text-xs font-bold">
                  {c.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="truncate">g/{c.slug}</span>
              </Link>
              <button
                type="button"
                onClick={() => onToggle(c.id)}
                className={
                  "mr-1 shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide " +
                  (isJoined
                    ? "bg-[var(--guide-chip)] text-[var(--guide-text)]"
                    : "bg-[var(--guide-accent)] text-white hover:bg-[var(--guide-accent-hover)]")
                }
              >
                {isJoined ? "Joined" : "Join"}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}