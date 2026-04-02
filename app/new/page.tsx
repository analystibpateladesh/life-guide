import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewPostForm } from "../components/NewPostForm";
import { getCommunities } from "@/lib/store";

type Props = { searchParams?: Promise<{ community?: string }> };

export default async function NewPostPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/new");
  }

  const communities = await getCommunities();
  const communityId = (await searchParams)?.community;

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-6 md:px-6">
      <NewPostForm communities={communities} defaultCommunityId={communityId} />
    </main>
  );
}