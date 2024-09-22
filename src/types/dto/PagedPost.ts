import { Post } from "./Post";

export type PagedPost = {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  posts: Post[];
};
