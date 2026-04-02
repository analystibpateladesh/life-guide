import Link from "next/link";
import { PostCard } from "./components/PostCard";
import { communityMap, getPosts } from "@/lib/store";

type Props = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const q = (await searchParams)?.q;
  const posts = await getPosts({ query: q, sort: "new" });
  const cmap = await communityMap();

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-6 md:px-6">
      <div className="mb-6 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-4">
        <h1 className="text-lg font-bold text-[var(--guide-text)] md:text-xl">
          Home feed
        </h1>
        <p className="mt-1 text-sm text-[var(--guide-muted)]">
          Latest guides. Data and images are stored in your Supabase project when deployed.
        </p>
        {q ? (
          <p className="mt-3 text-sm text-[var(--guide-text)]">
            Results for <strong>{q}</strong> — {posts.length}{" "}
            {posts.length === 1 ? "thread" : "threads"}
          </p>
        ) : null}
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
        <p className="mt-6 rounded-lg border border-dashed border-[var(--guide-border)] bg-[var(--guide-card)] px-4 py-10 text-center text-sm text-[var(--guide-muted)]">
          Nothing matched. Try another search or{" "}
          <Link href="/new" className="font-semibold text-[var(--guide-accent)] hover:underline">
            create a post
          </Link>
          .
        </p>
      ) : null}
    </main>
  );
}