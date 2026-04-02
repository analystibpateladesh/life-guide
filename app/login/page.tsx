"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";
  const err = sp.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(err ? "Could not sign in. Try again." : "");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setPending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-bold text-[var(--guide-text)]">Sign in</h1>
        <p className="mt-1 text-sm text-[var(--guide-muted)]">
          Use the email and password you registered with.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[var(--guide-border)] bg-[var(--guide-card)] p-6">
        {message ? (
          <p className="text-sm text-red-600" role="alert">
            {message}
          </p>
        ) : null}
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
            autoComplete="current-password"
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
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-center text-sm text-[var(--guide-muted)]">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-[var(--guide-accent)] hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}