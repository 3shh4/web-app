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

export function createStory(story: Omit<Story, "id">): Story {
  const stories = getStories();

  const newStory: Story = {
    ...story,
    id: crypto.randomUUID(),
  };

  saveStories([...stories, newStory]);

  return newStory;
}

export function updateStory(updatedStory: Story): void {
  const stories = getStories();

  const updated = stories.map((story) =>
    story.id === updatedStory.id ? updatedStory : story
  );

  saveStories(updated);
}

export function deleteStory(storyId: string): void {
  const stories = getStories().filter((story) => story.id !== storyId);
  saveStories(stories);
}

export function updateStoryStatus(storyId: string, status: StoryStatus): void {
  const stories = getStories();

  const updated = stories.map((story) =>
    story.id === storyId ? { ...story, status } : story
  );

  saveStories(updated);
}