export type StoryStatus = "todo" | "doing" | "done";

export interface Story {
  id: string;
  title: string;
  description: string;
  status: StoryStatus;
  projectId?: string;
  ownerId?: string;
}