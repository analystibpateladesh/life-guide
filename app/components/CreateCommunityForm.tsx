"use client";

import { useActionState } from "react";
import { createCommunity, type CommunityActionState } from "@/app/actions";

export function CreateCommunityForm() {
  const [state, action, pending] = useActionState(
    createCommunity,
    undefined as CommunityActionState,
  );

  return (
    <form action={action} className="space-y-3 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-4">
      <h2 className="text-sm font-bold text-[var(--guide-text)]">Start a community</h2>
      <p className="text-xs text-[var(--guide-muted)]">
        Pick a clear name. It becomes the URL:{" "}
        <span className="font-mono text-[var(--guide-text)]">g/your-name</span>
      </p>
      {state?.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="block text-xs font-semibold text-[var(--guide-muted)]">
        Name
        <input
          name="name"
          required
          className="mt-1 w-full rounded-md border border-[var(--guide-border)] bg-[var(--guide-input)] px-3 py-2 text-sm"
          placeholder="e.g. Apartment living"
        />
      </label>
      <label className="block text-xs font-semibold text-[var(--guide-muted)]">
        Description
        <textarea
          name="description"
          required
          rows={3}
          className="mt-1 w-full rounded-md border border-[var(--guide-border)] bg-[var(--guide-input)] px-3 py-2 text-sm"
          placeholder="What is this community about?"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--guide-text)] px-4 py-2 text-sm font-bold text-[var(--guide-header)] hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create community"}
      </button>
    </form>
  );
}