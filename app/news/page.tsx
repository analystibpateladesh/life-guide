import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "../components/PostCard";
import { communityMap, getCommunityBySlug, getPosts } from "@/lib/store";

export default async function NewsPage() {
  const hub = await getCommunityBySlug("news");
  if (!hub) notFound();
  const posts = await getPosts({ communityId: hub.id, sort: "new" });
  const cmap = await communityMap();

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-6 md:px-6">
      <div className="mb-6 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-4">
        <h1 className="text-lg font-bold text-[var(--guide-text)] md:text-xl">News & updates</h1>
        <p className="mt-1 text-sm text-[var(--guide-muted)]">
          g/{hub.slug} — timely posts and announcements.
        </p>
        <Link
          href={`/new?community=${hub.id}`}
          className="mt-3 inline-flex rounded-full bg-[var(--guide-accent)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--guide-accent-hover)]"
        >
          New post in News
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {posts.map((post) => {
          const com = cmap.get(post.communityId);
          if (!com) return null;
          return (
            <li key={post.id}>
              <PostCard post={post} communitySlug={com.slug} />
            </li>
          );
        })}
      </ul>
      {posts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--guide-border)] bg-[var(--guide-card)] px-4 py-10 text-center text-sm text-[var(--guide-muted)]">
          No posts in News yet.
        </p>
      ) : null}
    </main>
  );
}