"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugifyName } from "@/lib/slugify";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};
const MAX_BYTES = 4 * 1024 * 1024;

async function uploadPostImage(
  file: File | null,
  userId: string,
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 4 MB or smaller.");
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error("Only JPG, PNG, GIF, or WebP images are allowed.");
  }
  const ext = EXT[file.type];
  if (!ext) throw new Error("Unsupported image type.");

  const supabase = await createClient();
  const path = `${userId}/${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("post-images").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    throw new Error(error.message);
  }
  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}

export type PostActionState = { error?: string } | undefined;

export async function createPost(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You need to sign in to post." };
  }

  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");
  const communityId = String(formData.get("communityId") ?? "");
  const imageEntry = formData.get("image");

  if (!title.trim() || !body.trim()) {
    return { error: "Title and details are required." };
  }
  if (!communityId.trim()) {
    return { error: "Pick a community for this post." };
  }

  const imageFile =
    imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;

  let imageUrl: string | null;
  try {
    imageUrl = await uploadPostImage(imageFile, user.id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not upload image.";
    return { error: msg };
  }

  const { data: row, error } = await supabase
    .from("posts")
    .insert({
      title: title.trim(),
      body: body.trim(),
      image_url: imageUrl,
      community_id: communityId,
      author_id: user.id,
    })
    .select("id, community_id")
    .single();

  if (error || !row) {
    return { error: error?.message ?? "Could not create post." };
  }

  revalidatePath("/");
  revalidatePath("/popular");
  revalidatePath("/news");
  revalidatePath("/explore");
  const { data: com } = await supabase
    .from("communities")
    .select("slug")
    .eq("id", row.community_id)
    .single();
  if (com?.slug) {
    revalidatePath(`/c/${com.slug}`);
  }
  redirect(`/post/${row.id}`);
}

export type AnswerActionState =
  | { error?: string; ok?: boolean }
  | undefined;

export async function createAnswer(
  postId: string,
  _prev: AnswerActionState,
  formData: FormData,
): Promise<AnswerActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in to comment." };
  }

  const body = String(formData.get("body") ?? "");
  if (!body.trim()) {
    return { error: "Please write an answer before submitting." };
  }

  const { error } = await supabase.from("answers").insert({
    post_id: postId,
    body: body.trim(),
    author_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
  revalidatePath("/popular");
  return { ok: true };
}

export type CommunityActionState = { error?: string } | undefined;

export async function createCommunity(
  _prev: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in to create a community." };
  }

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  if (!name.trim()) {
    return { error: "Community name is required." };
  }

  const slug = slugifyName(name);
  const { data: existing } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    return {
      error: "A community with that name already exists. Try a different name.",
    };
  }

  const { data: row, error } = await supabase
    .from("communities")
    .insert({
      name: name.trim(),
      slug,
      description: description.trim(),
      created_by: user.id,
    })
    .select("slug")
    .single();

  if (error || !row) {
    return { error: error?.message ?? "Could not create community." };
  }

  revalidatePath("/");
  revalidatePath("/explore");
  redirect(`/c/${row.slug}`);
}

export async function toggleCommunityMembership(communityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in to join communities." };
  }

  const { data: existing } = await supabase
    .from("community_members")
    .select("community_id")
    .eq("user_id", user.id)
    .eq("community_id", communityId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("community_members")
      .delete()
      .eq("user_id", user.id)
      .eq("community_id", communityId);
  } else {
    await supabase.from("community_members").insert({
      user_id: user.id,
      community_id: communityId,
    });
  }

  revalidatePath("/");
  return { ok: true as const };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}