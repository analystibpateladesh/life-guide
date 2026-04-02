import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnswerForm } from "../../components/AnswerForm";
import { createClient } from "@/lib/supabase/server";
import { getCommunityById, getPost } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  const com = await getCommunityById(post.communityId);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const answers = [...post.answers].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-6 md:px-6">
      <p className="text-xs text-[var(--guide-muted)]">
        <Link href="/" className="font-semibold hover:text-[var(--guide-accent)] hover:underline">
          Home
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        {com ? (
          <Link
            href={`/c/${com.slug}`}
            className="font-semibold hover:text-[var(--guide-accent)] hover:underline"
          >
            g/{com.slug}
          </Link>
        ) : (
          <span className="font-semibold">Community</span>
        )}
      </p>
      <h1 className="mt-3 text-2xl font-bold leading-tight text-[var(--guide-text)]">
        {post.title}
      </h1>
      <p className="mt-2 text-xs text-[var(--guide-muted)]">
        Posted by <span className="font-semibold">u/{post.author}</span> ·{" "}
        {new Date(post.createdAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>

      {post.imageUrl ? (
        <div className="relative mt-5 aspect-video w-full max-h-[420px] overflow-hidden rounded-lg border border-[var(--guide-border)] bg-[var(--guide-input)]">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 42rem"
            priority
          />
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-5 shadow-sm">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--guide-text)]">
          {post.body}
        </p>
      </div>

      <section className="mt-10" aria-label="Answers">
        <h2 className="text-lg font-semibold text-[var(--guide-text)]">
          Comments ({answers.length})
        </h2>
        <ol className="mt-4 flex flex-col gap-4">
          {answers.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-[var(--guide-border)] bg-[var(--guide-input)] p-4"
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--guide-text)]">
                {a.body}
              </p>
              <p className="mt-3 text-xs text-[var(--guide-muted)]">
                u/{a.author} ·{" "}
                {new Date(a.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </li>
          ))}
        </ol>
        {answers.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--guide-muted)]">No comments yet.</p>
        ) : null}
      </section>

      <AnswerForm postId={post.id} isLoggedIn={Boolean(user)} />
    </main>
  );
}