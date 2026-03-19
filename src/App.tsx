import { useEffect, useMemo, useState } from 'react';
import './App.css';

import type { Project } from './models/Project';
import type { Story, StoryPriority, StoryStatus } from './models/Story';
import type { User } from './models/User';

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from './api/projectStorage';
import { getLoggedUser } from './api/userStorage';
import {
  getActiveProjectId,
  setActiveProjectId,
  clearActiveProjectId,
} from './api/activeProjectStorage';
import {
  getStoriesByProject,
  createStory,
  updateStory,
  deleteStory,
} from './api/storyStorage';

type StoryFormData = {
  name: string;
  description: string;
  priority: StoryPriority;
  status: StoryStatus;
};

const emptyStoryForm: StoryFormData = {
  name: '',
  description: '',
  priority: 'medium',
  status: 'todo',
};

function App() {
  const [user, setUser] = useState<User | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [stories, setStories] = useState<Story[]>([]);
  const [storyForm, setStoryForm] = useState<StoryFormData>(emptyStoryForm);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [storyFilter, setStoryFilter] = useState<'all' | StoryStatus>('all');

  useEffect(() => {
    const loggedUser = getLoggedUser();
    setUser(loggedUser);

    const loadedProjects = getProjects();
    setProjects(loadedProjects);

    const savedActiveProjectId = getActiveProjectId();

    if (savedActiveProjectId && loadedProjects.some((p) => p.id === savedActiveProjectId)) {
      setActiveProjectIdState(savedActiveProjectId);
    } else if (loadedProjects.length > 0) {
      setActiveProjectIdState(loadedProjects[0].id);
      setActiveProjectId(loadedProjects[0].id);
    }
  }, []);

  useEffect(() => {
    if (!activeProjectId) {
      setStories([]);
      return;
    }

    setStories(getStoriesByProject(activeProjectId));
  }, [activeProjectId]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  const filteredStories = useMemo(() => {
    if (storyFilter === 'all') return stories;
    return stories.filter((story) => story.status === storyFilter);
  }, [stories, storyFilter]);

  function refreshProjects() {
    const updatedProjects = getProjects();
    setProjects(updatedProjects);

    if (updatedProjects.length === 0) {
      setActiveProjectIdState(null);
      clearActiveProjectId();
      setStories([]);
      return;
    }

    const stillExists = updatedProjects.some((p) => p.id === activeProjectId);

    if (!stillExists) {
      const nextProjectId = updatedProjects[0].id;
      setActiveProjectIdState(nextProjectId);
      setActiveProjectId(nextProjectId);
    }
  }

  function refreshStories(projectId: string) {
    setStories(getStoriesByProject(projectId));
  }

  function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!projectName.trim() || !projectDescription.trim()) return;

    if (editingProjectId) {
      updateProject({
        id: editingProjectId,
        name: projectName.trim(),
        description: projectDescription.trim(),
      });
    } else {
      const created = createProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
      });

      if (!activeProjectId) {
        setActiveProjectIdState(created.id);
        setActiveProjectId(created.id);
      }
    }

    setProjectName('');
    setProjectDescription('');
    setEditingProjectId(null);
    refreshProjects();
  }

  function handleProjectEdit(project: Project) {
    setProjectName(project.name);
    setProjectDescription(project.description);
    setEditingProjectId(project.id);
  }

  function handleProjectDelete(projectId: string) {
    deleteProject(projectId);

    if (activeProjectId === projectId) {
      clearActiveProjectId();
    }

    refreshProjects();
  }

  function handleActiveProjectChange(projectId: string) {
    setActiveProjectIdState(projectId);
    setActiveProjectId(projectId);
    setEditingStoryId(null);
    setStoryForm(emptyStoryForm);
    refreshStories(projectId);
  }

  function handleStorySubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!activeProjectId || !user) return;
    if (!storyForm.name.trim() || !storyForm.description.trim()) return;

    if (editingStoryId) {
      const existing = stories.find((story) => story.id === editingStoryId);
      if (!existing) return;

      updateStory({
        ...existing,
        name: storyForm.name.trim(),
        description: storyForm.description.trim(),
        priority: storyForm.priority,
        status: storyForm.status,
      });
    } else {
      createStory({
        name: storyForm.name.trim(),
        description: storyForm.description.trim(),
        priority: storyForm.priority,
        status: storyForm.status,
        projectId: activeProjectId,
        ownerId: user.id,
      });
    }

    setStoryForm(emptyStoryForm);
    setEditingStoryId(null);
    refreshStories(activeProjectId);
  }

  function handleStoryEdit(story: Story) {
    setEditingStoryId(story.id);
    setStoryForm({
      name: story.name,
      description: story.description,
      priority: story.priority,
      status: story.status,
    });
  }

  function handleStoryDelete(storyId: string) {
    if (!activeProjectId) return;
    deleteStory(storyId);
    refreshStories(activeProjectId);
  }

  function resetProjectForm() {
    setProjectName('');
    setProjectDescription('');
    setEditingProjectId(null);
  }

  function resetStoryForm() {
    setStoryForm(emptyStoryForm);
    setEditingStoryId(null);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>ManageMe</h1>
          <p>Lab02 — użytkownik, aktywny projekt, historyjki</p>
        </div>

        <div className="user-box">
          <span>Zalogowany użytkownik:</span>
          <strong>
            {user ? `${user.firstName} ${user.lastName}` : 'Brak'}
          </strong>
        </div>
      </header>

      <main className="layout">
        <section className="card">
          <h2>Projekty</h2>

          <form onSubmit={handleProjectSubmit} className="form">
            <input
              type="text"
              placeholder="Nazwa projektu"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <textarea
              placeholder="Opis projektu"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
            <div className="row">
              <button type="submit">
                {editingProjectId ? 'Zapisz projekt' : 'Dodaj projekt'}
              </button>
              {editingProjectId && (
                <button type="button" onClick={resetProjectForm}>
                  Anuluj edycję
                </button>
              )}
            </div>
          </form>

          <div className="list">
            {projects.length === 0 ? (
              <p>Brak projektów.</p>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`list-item ${project.id === activeProjectId ? 'active' : ''}`}
                >
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                  </div>

                  <div className="row wrap">
                    <button type="button" onClick={() => handleActiveProjectChange(project.id)}>
                      Ustaw jako aktywny
                    </button>
                    <button type="button" onClick={() => handleProjectEdit(project)}>
                      Edytuj
                    </button>
                    <button type="button" onClick={() => handleProjectDelete(project.id)}>
                      Usuń
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card">
          <h2>Aktywny projekt</h2>
          {activeProject ? (
            <>
              <div className="active-project-box">
                <h3>{activeProject.name}</h3>
                <p>{activeProject.description}</p>
              </div>

              <hr />

              <h2>Historyjki</h2>

              <form onSubmit={handleStorySubmit} className="form">
                <input
                  type="text"
                  placeholder="Nazwa historyjki"
                  value={storyForm.name}
                  onChange={(e) =>
                    setStoryForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <textarea
                  placeholder="Opis historyjki"
                  value={storyForm.description}
                  onChange={(e) =>
                    setStoryForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />

                <div className="row">
                  <select
                    value={storyForm.priority}
                    onChange={(e) =>
                      setStoryForm((prev) => ({
                        ...prev,
                        priority: e.target.value as StoryPriority,
                      }))
                    }
                  >
                    <option value="low">Niski</option>
                    <option value="medium">Średni</option>
                    <option value="high">Wysoki</option>
                  </select>

                  <select
                    value={storyForm.status}
                    onChange={(e) =>
                      setStoryForm((prev) => ({
                        ...prev,
                        status: e.target.value as StoryStatus,
                      }))
                    }
                  >
                    <option value="todo">Todo</option>
                    <option value="doing">Doing</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="row">
                  <button type="submit">
                    {editingStoryId ? 'Zapisz historyjkę' : 'Dodaj historyjkę'}
                  </button>
                  {editingStoryId && (
                    <button type="button" onClick={resetStoryForm}>
                      Anuluj edycję
                    </button>
                  )}
                </div>
              </form>

              <div className="row filter-row">
                <label htmlFor="storyFilter">Filtr statusu:</label>
                <select
                  id="storyFilter"
                  value={storyFilter}
                  onChange={(e) =>
                    setStoryFilter(e.target.value as 'all' | StoryStatus)
                  }
                >
                  <option value="all">Wszystkie</option>
                  <option value="todo">Todo</option>
                  <option value="doing">Doing</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="list">
                {filteredStories.length === 0 ? (
                  <p>Brak historyjek dla wybranego filtra.</p>
                ) : (
                  filteredStories.map((story) => (
                    <div key={story.id} className="list-item">
                      <div>
                        <h3>{story.name}</h3>
                        <p>{story.description}</p>
                        <small>
                          Priorytet: <strong>{story.priority}</strong> | Status:{' '}
                          <strong>{story.status}</strong> | Data utworzenia:{' '}
                          <strong>{new Date(story.createdAt).toLocaleString()}</strong>
                        </small>
                      </div>

                      <div className="row wrap">
                        <button type="button" onClick={() => handleStoryEdit(story)}>
                          Edytuj
                        </button>
                        <button type="button" onClick={() => handleStoryDelete(story.id)}>
                          Usuń
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p>Najpierw dodaj i wybierz aktywny projekt.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;