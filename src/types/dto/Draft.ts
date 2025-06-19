export type Draft = {
  id: string;
  userId?: string;
  title: string;
  text: string;
  content: any[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};