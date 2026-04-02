export type Answer = {
  id: string;
  body: string;
  author: string;
  createdAt: string;
};

export type Community = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
};

export type Post = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  communityId: string;
  author: string;
  createdAt: string;
  answers: Answer[];
  /** Set on feed cards when answers are not loaded to save bandwidth */
  answerCount?: number;
};

export type PostsFilter = {
  query?: string | null;
  communityId?: string | null;
  sort?: "new" | "popular";
};