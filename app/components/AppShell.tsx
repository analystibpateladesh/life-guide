"use client";

import Link from "next/link";
import type { Community } from "@/lib/types";
import type { HeaderUser } from "./Header";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

function MobileNav() {
  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-[var(--guide-border)] bg-[var(--guide-header)] px-2 py-2 md:hidden">
      {[
        ["/", "Home"],
        ["/popular", "Popular"],
        ["/explore", "Explore"],
        ["/news", "News"],
      ].map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className="shrink-0 rounded-full bg-[var(--guide-chip)] px-3 py-1.5 text-xs font-bold text-[var(--guide-text)]"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({
  communities,
  user,
  joinedCommunityIds,
  children,
}: {
  communities: Community[];
  user: HeaderUser | null;
  joinedCommunityIds: string[];
  children: React.ReactNode;
}) {
  const isLoggedIn = Boolean(user);

  return (
    <div className="flex min-h-0 h-screen flex-col overflow-hidden bg-[var(--guide-bg)]">
      <Header user={user} />
      <MobileNav />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          communities={communities}
          joinedCommunityIds={joinedCommunityIds}
          isLoggedIn={isLoggedIn}
        />
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}