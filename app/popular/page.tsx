import { PostCard } from "../components/PostCard";
import { communityMap, getPosts } from "@/lib/store";

export default async function PopularPage() {
  const posts = await getPosts({ sort: "popular" });
  const cmap = await communityMap();

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-6 md:px-6">
      <div className="mb-6 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-4">
        <h1 className="text-lg font-bold text-[var(--guide-text)] md:text-xl">Popular</h1>
        <p className="mt-1 text-sm text-[var(--guide-muted)]">
          Threads with the most answers.
        </p>
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
    </main>
  );
}