"use client";

import { useActionState } from "react";
import { createPost, type PostActionState } from "@/app/actions";
import type { Community } from "@/lib/types";

export function NewPostForm({
  communities,
  defaultCommunityId,
}: {
  communities: Community[];
  defaultCommunityId?: string;
}) {
  const [state, action, pending] = useActionState(
    createPost,
    undefined as PostActionState,
  );

  const defaultVal =
    defaultCommunityId &&
    communities.some((c) => c.id === defaultCommunityId)
      ? defaultCommunityId
      : "";

  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="mx-auto max-w-2xl space-y-4 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-6 shadow-sm"
    >
      <h1 className="text-xl font-bold text-[var(--guide-text)]">Create a post</h1>
      <p className="text-sm text-[var(--guide-muted)]">
        Your display name comes from your profile. Images upload to Supabase Storage (public URL saved on the post).
      </p>
      {state?.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--guide-muted)]">
        Community
        <select
          name="communityId"
          required
          className="mt-1.5 w-full rounded-md border border-[var(--guide-border)] bg-[var(--guide-input)] px-3 py-2.5 text-sm text-[var(--guide-text)]"
          defaultValue={defaultVal}
        >
          <option value="" disabled>
            Choose a community
          </option>
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              g/{c.slug} — {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--guide-muted)]">
        Title
        <input
          name="title"
          required
          className="mt-1.5 w-full rounded-md border border-[var(--guide-border)] bg-[var(--guide-input)] px-3 py-2 text-sm text-[var(--guide-text)]"
          placeholder="Be specific — people search this later."
        />
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--guide-muted)]">
        Body
        <textarea
          name="body"
          required
          rows={8}
          className="mt-1.5 w-full rounded-md border border-[var(--guide-border)] bg-[var(--guide-input)] px-3 py-2 text-sm text-[var(--guide-text)]"
          placeholder="Context, constraints, what you already tried..."
        />
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--guide-muted)]">
        Image (optional)
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="mt-1.5 block w-full text-sm text-[var(--guide-muted)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--guide-chip)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--guide-text)]"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--guide-accent)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--guide-accent-hover)] disabled:opacity-60"
      >
        {pending ? "Posting..." : "Post"}
      </button>
    </form>
  );
}