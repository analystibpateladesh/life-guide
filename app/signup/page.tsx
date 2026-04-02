"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { display_name: displayName.trim() || email.split("@")[0] },
      },
    });
    setPending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Check your email to confirm your account, then sign in.");
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-bold text-[var(--guide-text)]">Create account</h1>
        <p className="mt-1 text-sm text-[var(--guide-muted)]">
          Your display name is shown on posts and comments.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-6">
        {message ? (
          <p className="text-sm text-[var(--guide-accent)]" role="status">
            {message}
          </p>
        ) : null}
        <label className="block text-xs font-semibold text-[var(--guide-muted)]">
          Display name
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--guide-border)] bg-[var(--guide-input)] px-3 py-2 text-sm"
            placeholder="How others see you"
          />
        </label>
        <label className="block text-xs font-semibold text-[var(--guide-muted)]">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--guide-border)] bg-[var(--guide-input)] px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-semibold text-[var(--guide-muted)]">
          Password
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--guide-border)] bg-[var(--guide-input)] px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-[var(--guide-accent)] py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="text-center text-sm text-[var(--guide-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--guide-accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}