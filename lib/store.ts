import { createClient } from "@/lib/supabase/server";
import type { Answer, Community, Post, PostsFilter } from "./types";

type DbCommunity = {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
};

function mapCommunity(row: DbCommunity): Community {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    createdAt: row.created_at,
  };
}

type DbPostList = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  community_id: string;
  author_id: string;
  created_at: string;
  author: { display_name: string } | null;
  answers: { id: string }[] | null;
};

export async function getCommunities(): Promise<Community[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => mapCommunity(r as DbCommunity));
}

export async function getCommunityBySlug(
  slug: string,
): Promise<Community | undefined> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? mapCommunity(data as DbCommunity) : undefined;
}

export async function getCommunityById(
  id: string,
): Promise<Community | undefined> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("communities")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapCommunity(data as DbCommunity) : undefined;
}

export async function communityMap(): Promise<Map<string, Community>> {
  const list = await getCommunities();
  return new Map(list.map((c) => [c.id, c]));
}

export async function countPostsInCommunity(
  communityId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);
  if (error) throw error;
  return count ?? 0;
}

export async function getJoinedCommunityIds(
  userId: string,
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_members")
    .select("community_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.community_id);
}

export async function getPosts(filter: PostsFilter = {}): Promise<Post[]> {
  const supabase = await createClient();
  const { query, communityId, sort = "new" } = filter;
  const q = query?.trim().toLowerCase();

  let answerPostIds: string[] = [];
  if (q) {
    const { data: matched } = await supabase
      .from("answers")
      .select("post_id")
      .ilike("body", `%${query!.trim()}%`);
    answerPostIds = [...new Set((matched ?? []).map((a) => a.post_id))];
  }

  let req = supabase.from("posts").select(`
    *,
    author:profiles (display_name),
    answers (id)
  `);
  if (communityId) {
    req = req.eq("community_id", communityId);
  }

  const { data: rows, error } = await req;
  if (error) throw error;

  let list = (rows ?? []) as unknown as DbPostList[];
  if (q) {
    list = list.filter((p) => {
      const inTitle = p.title.toLowerCase().includes(q);
      const inBody = p.body.toLowerCase().includes(q);
      const inAns = answerPostIds.includes(p.id);
      return inTitle || inBody || inAns;
    });
  }

  if (sort === "popular") {
    list = [...list].sort((a, b) => {
      const da = (a.answers?.length ?? 0) - (b.answers?.length ?? 0);
      if (da !== 0) return -da;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  } else {
    list = [...list].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  return list.map((p) => {
    const n = p.answers?.length ?? 0;
    return {
      id: p.id,
      title: p.title,
      body: p.body,
      imageUrl: p.image_url,
      communityId: p.community_id,
      author: p.author?.display_name ?? "User",
      createdAt: p.created_at,
      answers: [],
      answerCount: n,
    };
  });
}

type DbAnswer = {
  id: string;
  body: string;
  created_at: string;
  author: { display_name: string } | null;
};

export async function getPost(id: string): Promise<Post | undefined> {
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, author:profiles (display_name)")
    .eq("id", id)
    .maybeSingle();
  if (error || !post) return undefined;

  const row = post as unknown as DbPostList;
  const { data: ansRows } = await supabase
    .from("answers")
    .select("*, author:profiles (display_name)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const answers: Answer[] = (ansRows ?? []).map((a) => {
    const ar = a as unknown as DbAnswer;
    return {
      id: ar.id,
      body: ar.body,
      author: ar.author?.display_name ?? "User",
      createdAt: ar.created_at,
    };
  });

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.image_url,
    communityId: row.community_id,
    author: row.author?.display_name ?? "User",
    createdAt: row.created_at,
    answers,
  };
}