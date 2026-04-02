import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateCommunityForm } from "../components/CreateCommunityForm";
import { countPostsInCommunity, getCommunities } from "@/lib/store";

export default async function ExplorePage() {
  const communities = await getCommunities();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const counts = await Promise.all(
    communities.map((c) => countPostsInCommunity(c.id)),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-6 md:px-6">
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <h1 className="text-lg font-bold text-[var(--guide-text)] md:text-xl">Explore communities</h1>
          <p className="mt-1 text-sm text-[var(--guide-muted)]">
            Join groups from the sidebar (sign in required). Create a new community below.
          </p>
        </div>
        {user ? (
          <CreateCommunityForm />
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--guide-border)] bg-[var(--guide-card)] p-4 text-sm text-[var(--guide-muted)]">
            <Link href="/login?next=/explore" className="font-semibold text-[var(--guide-accent)] hover:underline">
              Sign in
            </Link>{" "}
            to create a community.
          </div>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {communities.map((c, i) => {
          const n = counts[i] ?? 0;
          return (
            <li key={c.id}>
              <Link
                href={`/c/${c.slug}`}
                className="flex items-start gap-3 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-4 hover:bg-[var(--guide-hover)]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--guide-chip)] text-sm font-bold text-[var(--guide-text)]">
                  {c.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--guide-text)]">g/{c.slug}</p>
                  <p className="mt-0.5 text-sm text-[var(--guide-muted)]">{c.description}</p>
                  <p className="mt-2 text-xs font-bold text-[var(--guide-muted)]">
                    {n} {n === 1 ? "post" : "posts"}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}