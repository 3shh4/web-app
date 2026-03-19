import type { Story } from '../models/Story';

const STORIES_KEY = 'manageme_stories';

function readStories(): Story[] {
  const raw = localStorage.getItem(STORIES_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as Story[];
  } catch {
    return [];
  }
}

function writeStories(stories: Story[]): void {
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
}

export function getAllStories(): Story[] {
  return readStories();
}

export function getStoriesByProject(projectId: string): Story[] {
  return readStories().filter((story) => story.projectId === projectId);
}

export function createStory(
  story: Omit<Story, 'id' | 'createdAt'>
): Story {
  const newStory: Story = {
    ...story,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const stories = readStories();
  stories.push(newStory);
  writeStories(stories);

  return newStory;
}

export function updateStory(updatedStory: Story): void {
  const stories = readStories().map((story) =>
    story.id === updatedStory.id ? updatedStory : story
  );
  writeStories(stories);
}

export function deleteStory(storyId: string): void {
  const stories = readStories().filter((story) => story.id !== storyId);
  writeStories(stories);
}