import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "../../components/PostCard";
import { communityMap, getCommunityBySlug, getPosts } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

export default async function CommunityPage({ params }: Props) {
  const { slug } = await params;
  const com = await getCommunityBySlug(slug);
  if (!com) notFound();
  const posts = await getPosts({ communityId: com.id, sort: "new" });
  const cmap = await communityMap();

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-6 md:px-6">
      <header className="mb-6 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--guide-muted)]">
          Community
        </p>
        <h1 className="mt-1 text-xl font-extrabold text-[var(--guide-text)]">
          g/{com.slug}
        </h1>
        <p className="mt-2 text-sm text-[var(--guide-muted)]">{com.description}</p>
        <Link
          href={`/new?community=${com.id}`}
          className="mt-4 inline-flex rounded-full bg-[var(--guide-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--guide-accent-hover)]"
        >
          Create post
        </Link>
      </header>
      <ul className="flex flex-col gap-3">
        {posts.map((post) => {
          const c = cmap.get(post.communityId);
          if (!c) return null;
          return (
            <li key={post.id}>
              <PostCard post={post} communitySlug={c.slug} />
            </li>
          );
        })}
      </ul>
      {posts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--guide-border)] bg-[var(--guide-card)] px-4 py-10 text-center text-sm text-[var(--guide-muted)]">
          Be the first to post here.
        </p>
      ) : null}
    </main>
  );
}