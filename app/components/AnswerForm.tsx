"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import {
  createAnswer,
  type AnswerActionState,
} from "@/app/actions";

export function AnswerForm({
  postId,
  isLoggedIn,
}: {
  postId: string;
  isLoggedIn: boolean;
}) {
  const bound = createAnswer.bind(null, postId);
  const [state, action, pending] = useActionState(
    bound,
    undefined as AnswerActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  if (!isLoggedIn) {
    return (
      <div className="mt-4 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-4 text-sm text-[var(--guide-muted)]">
        <Link href="/login" className="font-semibold text-[var(--guide-accent)] hover:underline">
          Sign in
        </Link>{" "}
        to leave a comment.
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="mt-4 space-y-3 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-4"
    >
      <h3 className="text-sm font-semibold text-[var(--guide-text)]">Add a comment</h3>
      {state?.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="block text-xs font-medium text-[var(--guide-muted)]">
        Comment
        <textarea
          name="body"
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-[var(--guide-border)] bg-[var(--guide-input)] px-3 py-2 text-sm text-[var(--guide-text)]"
          placeholder="Share practical steps or what worked for you."
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--guide-accent)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--guide-accent-hover)] disabled:opacity-60"
      >
        {pending ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}