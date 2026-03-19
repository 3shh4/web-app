import { useMemo, useState } from "react";
import "./App.css";

import type { User } from "./models/User";
import type { Story } from "./models/Story";
import type { Task, TaskPriority } from "./models/Task";

import { getUsers, getLoggedUser } from "./api/userStorage";
import { getStories } from "./api/storyStorage";
import {
  assignTask,
  createTask,
  deleteTask,
  getTasks,
  markTaskDone,
  updateTask,
} from "./api/taskStorage";

type TaskFormState = {
  name: string;
  description: string;
  priority: TaskPriority;
  storyId: string;
  estimatedHours: number;
};

const emptyForm: TaskFormState = {
  name: "",
  description: "",
  priority: "medium",
  storyId: "",
  estimatedHours: 1,
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pl-PL");
}

function getPriorityLabel(priority: TaskPriority) {
  switch (priority) {
    case "low":
      return "Niski";
    case "medium":
      return "Średni";
    case "high":
      return "Wysoki";
    default:
      return priority;
  }
}

function getStatusLabel(status: Task["status"]) {
  switch (status) {
    case "todo":
      return "Todo";
    case "doing":
      return "Doing";
    case "done":
      return "Done";
    default:
      return status;
  }
}

function App() {
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [loggedUser, setLoggedUser] = useState<User | null>(() => getLoggedUser());
  const [stories, setStories] = useState<Story[]>(() => getStories());
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());

  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  function refreshData() {
    setUsers(getUsers());
    setLoggedUser(getLoggedUser());
    setStories(getStories());
    setTasks(getTasks());
  }

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const executionUsers = useMemo(
    () => users.filter((user) => user.role === "developer" || user.role === "devops"),
    [users]
  );

  function resetForm() {
    setForm(emptyForm);
    setEditingTaskId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim() || !form.description.trim() || !form.storyId) {
      alert("Uzupełnij nazwę, opis i historyjkę.");
      return;
    }

    if (editingTaskId) {
      const taskToUpdate = tasks.find((task) => task.id === editingTaskId);
      if (!taskToUpdate) return;

      updateTask({
        ...taskToUpdate,
        name: form.name,
        description: form.description,
        priority: form.priority,
        storyId: form.storyId,
        estimatedHours: Number(form.estimatedHours),
      });
    } else {
      createTask({
        name: form.name,
        description: form.description,
        priority: form.priority,
        storyId: form.storyId,
        estimatedHours: Number(form.estimatedHours),
      });
    }

    refreshData();
    resetForm();
  }

  function startEdit(task: Task) {
    setEditingTaskId(task.id);
    setForm({
      name: task.name,
      description: task.description,
      priority: task.priority,
      storyId: task.storyId,
      estimatedHours: task.estimatedHours,
    });
    setSelectedTaskId(task.id);
  }

  function handleDelete(taskId: string) {
    deleteTask(taskId);

    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }

    refreshData();
  }

  function handleAssign(taskId: string, userId: string) {
    if (!userId) return;

    assignTask(taskId, userId);
    refreshData();
  }

  function handleMarkDone(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);

    if (!task?.assignedUserId) {
      alert("Najpierw przypisz osobę do zadania.");
      return;
    }

    markTaskDone(taskId);
    refreshData();
  }

  function getStoryName(storyId: string) {
    return stories.find((story) => story.id === storyId)?.title ?? "Brak historyjki";
  }

  function getUserName(userId?: string) {
    if (!userId) return "-";
    return users.find((user) => user.id === userId)?.name ?? "-";
  }

  const todoTasks = tasks.filter((task) => task.status === "todo");
  const doingTasks = tasks.filter((task) => task.status === "doing");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <div className="container">
      <header className="page-header">
        <div className="page-title-box">
          <p className="eyebrow">Project Management App</p>
          <h1>ManageMe - Lab03</h1>
          <p className="page-subtitle">Zadania, użytkownicy i tablica kanban</p>
        </div>

        <div className="logged-box">
          <span className="logged-label">Zalogowany</span>
          <strong className="logged-user">
            {loggedUser ? loggedUser.name : "Brak danych"}
          </strong>
          <span className="logged-role">
            {loggedUser ? loggedUser.role : "brak roli"}
          </span>
        </div>
      </header>

      <section className="card">
        <div className="section-heading">
          <h2>{editingTaskId ? "Edytuj zadanie" : "Dodaj zadanie"}</h2>
          <p>Utwórz nowe zadanie i przypisz je do wybranej historyjki.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nazwa zadania"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value as TaskPriority })
            }
          >
            <option value="low">Niski</option>
            <option value="medium">Średni</option>
            <option value="high">Wysoki</option>
          </select>

          <select
            value={form.storyId}
            onChange={(e) => setForm({ ...form, storyId: e.target.value })}
          >
            <option value="">Wybierz historyjkę</option>
            {stories.map((story) => (
              <option key={story.id} value={story.id}>
                {story.title} ({story.status})
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            placeholder="Przewidywany czas"
            value={form.estimatedHours}
            onChange={(e) =>
              setForm({ ...form, estimatedHours: Number(e.target.value) })
            }
          />

          <textarea
            placeholder="Opis zadania"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="button-row">
            <button type="submit" className="primary-btn">
              {editingTaskId ? "Zapisz zmiany" : "Dodaj zadanie"}
            </button>

            {editingTaskId && (
              <button type="button" className="secondary-btn" onClick={resetForm}>
                Anuluj edycję
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <h2>Lista zadań</h2>
          <p>Przegląd wszystkich zadań wraz z aktualnym statusem i osobą odpowiedzialną.</p>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nazwa</th>
                <th>Priorytet</th>
                <th>Status</th>
                <th>Historyjka</th>
                <th>Osoba</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="task-name-cell">{task.name}</td>
                  <td>
                    <span className={`badge priority-badge ${task.priority}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-badge ${task.status}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </td>
                  <td>{getStoryName(task.storyId)}</td>
                  <td>{getUserName(task.assignedUserId)}</td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="table-btn"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      Szczegóły
                    </button>
                    <button
                      type="button"
                      className="table-btn"
                      onClick={() => startEdit(task)}
                    >
                      Edytuj
                    </button>
                    <button
                      type="button"
                      className="table-btn danger-btn"
                      onClick={() => handleDelete(task.id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state-cell">
                    Brak zadań.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedTask && (
        <section className="card">
          <div className="section-heading">
            <h2>Szczegóły zadania</h2>
            <p>Podgląd danych zadania, przypisanej historyjki i osoby odpowiedzialnej.</p>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Nazwa</span>
              <strong>{selectedTask.name}</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">Priorytet</span>
              <span className={`badge priority-badge ${selectedTask.priority}`}>
                {getPriorityLabel(selectedTask.priority)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className={`badge status-badge ${selectedTask.status}`}>
                {getStatusLabel(selectedTask.status)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Historyjka</span>
              <strong>{getStoryName(selectedTask.storyId)}</strong>
            </div>

            <div className="detail-item detail-item-full">
              <span className="detail-label">Opis</span>
              <strong>{selectedTask.description}</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">Przewidywany czas</span>
              <strong>{selectedTask.estimatedHours}h</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">Zrealizowane roboczogodziny</span>
              <strong>{selectedTask.workedHours}h</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">Data dodania</span>
              <strong>{formatDate(selectedTask.createdAt)}</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">Data startu</span>
              <strong>{formatDate(selectedTask.startedAt)}</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">Data zakończenia</span>
              <strong>{formatDate(selectedTask.finishedAt)}</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">Przypisana osoba</span>
              <strong>{getUserName(selectedTask.assignedUserId)}</strong>
            </div>
          </div>

          <div className="details-actions">
            <select
              defaultValue=""
              onChange={(e) => handleAssign(selectedTask.id, e.target.value)}
            >
              <option value="">Przypisz osobę</option>
              {executionUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>

            <button
              type="button"
              className="success-btn"
              onClick={() => handleMarkDone(selectedTask.id)}
            >
              Oznacz jako done
            </button>
          </div>
        </section>
      )}

      <section className="card">
        <div className="section-heading">
          <h2>Tablica Kanban</h2>
          <p>Podział zadań według etapu realizacji: todo, doing oraz done.</p>
        </div>

        <div className="kanban">
          <div className="kanban-column todo-column">
            <div className="kanban-header">
              <h3>TODO</h3>
              <span className="column-count">{todoTasks.length}</span>
            </div>

            {todoTasks.length === 0 ? (
              <p className="kanban-empty">Brak zadań</p>
            ) : (
              todoTasks.map((task) => (
                <div key={task.id} className="kanban-card">
                  <strong>{task.name}</strong>
                  <span>{getStoryName(task.storyId)}</span>
                  <div className="kanban-meta">
                    <span className={`badge priority-badge ${task.priority}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    <span className={`badge status-badge ${task.status}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="kanban-column doing-column">
            <div className="kanban-header">
              <h3>DOING</h3>
              <span className="column-count">{doingTasks.length}</span>
            </div>

            {doingTasks.length === 0 ? (
              <p className="kanban-empty">Brak zadań</p>
            ) : (
              doingTasks.map((task) => (
                <div key={task.id} className="kanban-card">
                  <strong>{task.name}</strong>
                  <span>{getStoryName(task.storyId)}</span>
                  <small>Osoba: {getUserName(task.assignedUserId)}</small>
                  <div className="kanban-meta">
                    <span className={`badge priority-badge ${task.priority}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    <span className={`badge status-badge ${task.status}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="kanban-column done-column">
            <div className="kanban-header">
              <h3>DONE</h3>
              <span className="column-count">{doneTasks.length}</span>
            </div>

            {doneTasks.length === 0 ? (
              <p className="kanban-empty">Brak zadań</p>
            ) : (
              doneTasks.map((task) => (
                <div key={task.id} className="kanban-card">
                  <strong>{task.name}</strong>
                  <span>{getStoryName(task.storyId)}</span>
                  <small>Zakończono: {formatDate(task.finishedAt)}</small>
                  <div className="kanban-meta">
                    <span className={`badge priority-badge ${task.priority}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    <span className={`badge status-badge ${task.status}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;