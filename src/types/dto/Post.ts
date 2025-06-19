type Comment = {
  id: string;
  text: string;
};
type Thought = {
  id: string;
  thoughts: string[];
};
export type Post = {
  id: string;
  userId?: string;
  title: string;
  text: string;
  content: any[];
  categories: string[];
  tags: string[];
  comments: Comment[];
  thoughts: Thought[];
  createdAt: string;
  updatedAt: string;
};