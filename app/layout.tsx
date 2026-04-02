import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { getCommunities, getJoinedCommunityIds } from "@/lib/store";
import { AppShell } from "./components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Guide — life tips from real people",
  description:
    "Sign in, join communities, posts and images stored in Supabase — works when hosted.",
};

function BootError({ message }: { message: string }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: 24,
          maxWidth: 640,
          margin: "0 auto",
          lineHeight: 1.5,
        }}
      >
        <h1 style={{ fontSize: 20 }}>Daily Guide cannot load</h1>
        <p>
          Copy <code>.env.local.example</code> to <code>.env.local</code> with your Supabase URL and anon key, run <code>supabase/schema.sql</code> in the SQL Editor, then restart <code>npm run dev</code>.
        </p>
        <pre
          style={{
            background: "#f4f4f5",
            padding: 12,
            overflow: "auto",
            fontSize: 13,
          }}
        >
          {message}
        </pre>
      </body>
    </html>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let headerUser: { displayName: string; email: string } | null = null;
    let joinedCommunityIds: string[] = [];

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      headerUser = {
        displayName:
          profile?.display_name ??
          user.email?.split("@")[0] ??
          "User",
        email: user.email ?? "",
      };
      joinedCommunityIds = await getJoinedCommunityIds(user.id);
    }

    const communities = await getCommunities();

    return (
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full font-sans">
          <AppShell
            communities={communities}
            user={headerUser}
            joinedCommunityIds={joinedCommunityIds}
          >
            {children}
          </AppShell>
        </body>
      </html>
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return <BootError message={message} />;
  }
}