import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types";

function excerpt(text: string, max = 140) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}...`;
}

export function PostCard({
  post,
  communitySlug,
}: {
  post: Post;
  communitySlug: string;
}) {
  const answerCount = post.answerCount ?? post.answers.length;

  return (
    <article className="rounded-md border border-[var(--guide-border)] bg-[var(--guide-card)] shadow-sm">
      <Link
        href={`/post/${post.id}`}
        className="flex gap-3 p-3 hover:bg-[var(--guide-hover)] md:p-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--guide-muted)]">
            <span className="font-semibold text-[var(--guide-text)]">
              g/{communitySlug}
            </span>
            <span aria-hidden>·</span>
            <span>Posted by u/{post.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
          <h2 className="mt-1.5 text-base font-semibold leading-snug text-[var(--guide-text)] md:text-lg">
            {post.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--guide-muted)]">
            {excerpt(post.body)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-[var(--guide-muted)]">
            <span className="text-[var(--guide-accent)]">
              {answerCount} {answerCount === 1 ? "comment" : "comments"}
            </span>
          </div>
        </div>
        {post.imageUrl ? (
          <div className="relative mt-1 h-[72px] w-[96px] shrink-0 overflow-hidden rounded border border-[var(--guide-border)] bg-[var(--guide-input)] md:h-[88px] md:w-[112px]">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 96px, 112px"
            />
          </div>
        ) : null}
      </Link>
    </article>
  );
}