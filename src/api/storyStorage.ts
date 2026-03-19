import type { Story, StoryStatus } from "../models/Story";

const STORIES_KEY = "manageme_stories";

function seedStories() {
  const existing = localStorage.getItem(STORIES_KEY);

  if (!existing) {
    const mock: Story[] = [
      {
        id: crypto.randomUUID(),
        title: "Auth system",
        description: "Login + register",
        status: "todo",
      },
      {
        id: crypto.randomUUID(),
        title: "Dashboard",
        description: "Main view",
        status: "todo",
      },
    ];

    localStorage.setItem(STORIES_KEY, JSON.stringify(mock));
  }
}

export function getStories(): Story[] {
  seedStories();
  const data = localStorage.getItem(STORIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveStories(stories: Story[]): void {
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
}

export function updateStoryStatus(storyId: string, status: StoryStatus): void {
  const stories = getStories();
  const updated = stories.map((story) =>
    story.id === storyId ? { ...story, status } : story
  );
  saveStories(updated);
}