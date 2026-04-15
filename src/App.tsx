import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import {
  Box,
  Container,
  CssBaseline,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import TaskForm, { type TaskFormState } from "./components/TaskForm";
import TaskTable from "./components/TaskTable";
import TaskDetails from "./components/TaskDetails";
import KanbanBoard from "./components/KanbanBoard";

import type { User } from "./models/User";
import type { Story } from "./models/Story";
import type { Task } from "./models/Task";

import { getUsers, getLoggedUser } from "./api/userStorage";
import { getStories } from "./api/storyStorage";
import {
  assignTask,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./api/taskStorage";

type ThemeMode = "light" | "dark";

const getInitialThemeMode = (): ThemeMode => {
  const saved = localStorage.getItem("manageme-theme");

  if (saved === "light" || saved === "dark") return saved;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

const emptyForm: TaskFormState = {
  name: "",
  description: "",
  priority: "medium",
  storyId: "",
  estimatedHours: 1,
};

function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    localStorage.setItem("manageme-theme", themeMode);
  }, [themeMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: "#3b82f6",
          },
          secondary: {
            main: "#6366f1",
          },
          background: {
            default: themeMode === "dark" ? "#0f172a" : "#f8fafc",
            paper: themeMode === "dark" ? "#1e293b" : "#ffffff",
          },
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
        },
      }),
    [themeMode]
  );

  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [loggedUser, setLoggedUser] = useState<User | null>(() => getLoggedUser());
  const [stories, setStories] = useState<Story[]>(() => getStories());
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());

  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const formSectionRef = useRef<HTMLDivElement | null>(null);

  function refreshData() {
    setUsers(getUsers());
    setLoggedUser(getLoggedUser());
    setStories(getStories());
    setTasks(getTasks());
  }

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const executionUsers = useMemo(
    () => users.filter((u) => u.role === "developer" || u.role === "devops"),
    [users]
  );

  function resetForm() {
    setForm(emptyForm);
    setEditingTaskId(null);
  }

  function handleFormChange(
    field: keyof TaskFormState,
    value: string | number
  ) {
    setForm((prev: TaskFormState) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim() || !form.description.trim() || !form.storyId) {
      alert("Uzupełnij dane.");
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
    setSelectedTaskId(null);

    setForm({
      name: task.name,
      description: task.description,
      priority: task.priority,
      storyId: task.storyId,
      estimatedHours: task.estimatedHours,
    });

    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
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

  function handleChangeStatus(taskId: string, status: Task["status"]) {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    updateTask({
      ...taskToUpdate,
      status,
      startedAt:
        status === "doing"
          ? taskToUpdate.startedAt ?? new Date().toISOString()
          : status === "todo"
          ? undefined
          : taskToUpdate.startedAt,
      finishedAt: status === "done" ? new Date().toISOString() : undefined,
    });

    refreshData();
  }

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 1.5,
                  color: "primary.main",
                  fontWeight: 600,
                }}
              >
                PROJECT MANAGEMENT APP
              </Typography>

              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ManageMe
              </Typography>

              <Typography color="text.secondary">
                Zadania, użytkownicy i tablica kanban
              </Typography>
            </Box>

            <Box
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 3,
                bgcolor: "background.paper",
                boxShadow: 2,
                textAlign: "right",
                minWidth: 180,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                ZALOGOWANY
              </Typography>

              <Typography sx={{ fontWeight: 600 }}>
                {loggedUser?.name ?? "Brak"}
              </Typography>

              <Typography variant="caption" color="primary.main">
                {loggedUser?.role ?? "-"}
              </Typography>

              <Box sx={{ mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={themeMode === "dark"}
                      onChange={() =>
                        setThemeMode((prev) => (prev === "light" ? "dark" : "light"))
                      }
                    />
                  }
                  label={themeMode}
                />
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 4,
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(320px, 380px) 1fr",
              },
              alignItems: "start",
            }}
          >
            <Box ref={formSectionRef}>
              <TaskForm
                form={form}
                stories={stories}
                onSubmit={handleSubmit}
                onChange={handleFormChange}
                editingTaskId={editingTaskId}
                onCancel={resetForm}
              />
            </Box>

            <TaskTable
              tasks={tasks}
              onEdit={startEdit}
              onDelete={handleDelete}
              onSelect={(task) =>
                setSelectedTaskId((prev) => (prev === task.id ? null : task.id))
              }
            />

            <TaskDetails
              selectedTask={selectedTask}
              users={executionUsers}
              stories={stories}
              onAssign={handleAssign}
              onChangeStatus={handleChangeStatus}
              onClose={() => setSelectedTaskId(null)}
            />

            <KanbanBoard
              todoTasks={todoTasks}
              doingTasks={doingTasks}
              doneTasks={doneTasks}
            />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;