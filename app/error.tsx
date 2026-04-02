"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-bold text-red-700">Something went wrong</h1>
      <p className="mt-2 text-sm text-[var(--guide-muted)]">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-full bg-[var(--guide-accent)] px-4 py-2 text-sm font-bold text-white"
      >
        Try again
      </button>
    </main>
  );
}