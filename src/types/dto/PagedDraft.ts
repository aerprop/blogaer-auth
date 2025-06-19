import { Draft } from "./Draft";

export type PagedDraft = {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  drafts: Draft[];
};