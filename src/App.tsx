import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import {
  Badge,
  Box,
  Button,
  Container,
  CssBaseline,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import TaskForm, {
  type TaskFormErrors,
  type TaskFormState,
} from "./components/TaskForm";
import TaskTable from "./components/TaskTable";
import TaskDetails from "./components/TaskDetails";
import KanbanBoard from "./components/KanbanBoard";
import NotificationsList from "./components/NotificationsList";
import NotificationDetails from "./components/NotificationDetails";
import NotificationDialog from "./components/NotificationDialog";

import type { User } from "./models/User";
import type { Story } from "./models/Story";
import type { Task } from "./models/Task";
import type { Notification } from "./models/Notification";

import { getUsers, getLoggedUser } from "./api/userStorage";
import { getStories } from "./api/storyStorage";
import {
  assignTask,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./api/taskStorage";
import {
  createNotification,
  getNotificationById,
  getNotificationsByRecipient,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "./api/notificationStorage";

type ThemeMode = "light" | "dark";
type AppView = "dashboard" | "notifications" | "notification-details";

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

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    getLoggedUser() ? getNotificationsByRecipient(getLoggedUser()!.id) : []
  );
  const [unreadCount, setUnreadCount] = useState<number>(() =>
    getLoggedUser() ? getUnreadCount(getLoggedUser()!.id) : 0
  );

  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<TaskFormErrors>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(
    null
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogNotification, setDialogNotification] = useState<Notification | null>(
    null
  );

  const formSectionRef = useRef<HTMLDivElement | null>(null);

  function refreshData() {
    const freshUsers = getUsers();
    const freshLoggedUser = getLoggedUser();
    const freshStories = getStories();
    const freshTasks = getTasks();

    setUsers(freshUsers);
    setLoggedUser(freshLoggedUser);
    setStories(freshStories);
    setTasks(freshTasks);

    if (freshLoggedUser) {
      setNotifications(getNotificationsByRecipient(freshLoggedUser.id));
      setUnreadCount(getUnreadCount(freshLoggedUser.id));
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const selectedNotification = useMemo(
    () =>
      selectedNotificationId ? getNotificationById(selectedNotificationId) ?? null : null,
    [selectedNotificationId]
  );

  const executionUsers = useMemo(
    () => users.filter((u) => u.role === "developer" || u.role === "devops"),
    [users]
  );

  function validateForm(values: TaskFormState): TaskFormErrors {
    const errors: TaskFormErrors = {};

    if (!values.name.trim()) {
      errors.name = "Podaj nazwę zadania.";
    }

    if (!values.storyId) {
      errors.storyId = "Wybierz historyjkę.";
    }

    if (!values.description.trim()) {
      errors.description = "Podaj opis zadania.";
    }

    if (!values.estimatedHours || Number(values.estimatedHours) < 1) {
      errors.estimatedHours = "Przewidywany czas musi być co najmniej 1h.";
    }

    return errors;
  }

  function resetForm() {
    setForm(emptyForm);
    setFormErrors({});
    setEditingTaskId(null);
  }

  function handleFormChange(
    field: keyof TaskFormState,
    value: string | number
  ) {
    setForm((prev: TaskFormState) => ({ ...prev, [field]: value }));

    setFormErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }

  function getStoryTitle(storyId: string) {
    return stories.find((story) => story.id === storyId)?.title ?? "Nieznana historyjka";
  }

  function getStoryOwnerId(storyId: string) {
    const story = stories.find((item) => item.id === storyId);
    return story?.ownerId ?? loggedUser?.id ?? "";
  }

  function maybeOpenNotificationDialog(notification: Notification) {
    if (!loggedUser) return;
    if (notification.recipientId !== loggedUser.id) return;
    if (notification.priority === "medium" || notification.priority === "high") {
      setDialogNotification(notification);
      setDialogOpen(true);
    }
  }

  function openNotificationsView() {
    setSelectedNotificationId(null);
    setCurrentView("notifications");
    refreshData();
  }

  function handleOpenNotification(notificationId: string) {
    const notification = getNotificationById(notificationId);
    if (!notification) return;

    if (!notification.isRead) {
      markAsRead(notificationId);
    }

    setSelectedNotificationId(notificationId);
    setCurrentView("notification-details");
    refreshData();
  }

  function handleMarkNotificationAsRead(notificationId: string) {
    markAsRead(notificationId);
    refreshData();
  }

  function handleMarkAllNotificationsAsRead() {
    if (!loggedUser) return;
    markAllAsRead(loggedUser.id);
    refreshData();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
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

      const recipientId = getStoryOwnerId(form.storyId);

      if (recipientId) {
        const notification = createNotification({
          title: "Nowe zadanie w historyjce",
          message: `Dodano zadanie "${form.name}" do historyjki "${getStoryTitle(
            form.storyId
          )}".`,
          priority: "medium",
          recipientId,
        });

        maybeOpenNotificationDialog(notification);
      }
    }

    refreshData();
    resetForm();
  }

  function startEdit(task: Task) {
    setEditingTaskId(task.id);
    setSelectedTaskId(null);
    setFormErrors({});

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
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (!taskToDelete) return;

    deleteTask(taskId);

    const recipientId = getStoryOwnerId(taskToDelete.storyId);

    if (recipientId) {
      const notification = createNotification({
        title: "Usunięto zadanie z historyjki",
        message: `Usunięto zadanie "${taskToDelete.name}" z historyjki "${getStoryTitle(
          taskToDelete.storyId
        )}".`,
        priority: "medium",
        recipientId,
      });

      maybeOpenNotificationDialog(notification);
    }

    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }

    refreshData();
  }

  function handleAssign(taskId: string, userId: string) {
    if (!userId) return;

    const taskToAssign = tasks.find((task) => task.id === taskId);
    if (!taskToAssign) return;

    const userToAssign = users.find((user) => user.id === userId);
    if (!userToAssign) return;

    assignTask(taskId, userId);

    const notification = createNotification({
      title: "Przypisano Ci zadanie",
      message: `Zostało Ci przypisane zadanie "${taskToAssign.name}" w historyjce "${getStoryTitle(
        taskToAssign.storyId
      )}".`,
      priority: "high",
      recipientId: userId,
    });

    maybeOpenNotificationDialog(notification);
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

    const recipientId = getStoryOwnerId(taskToUpdate.storyId);

    if (recipientId && status !== "todo") {
      const priority = status === "done" ? "medium" : "low";

      const notification = createNotification({
        title: "Zmiana statusu zadania",
        message: `Zadanie "${taskToUpdate.name}" zmieniło status na "${status.toUpperCase()}" w historyjce "${getStoryTitle(
          taskToUpdate.storyId
        )}".`,
        priority,
        recipientId,
      });

      maybeOpenNotificationDialog(notification);
    }

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
                {currentView === "dashboard" && "Zadania, użytkownicy i tablica kanban"}
                {currentView === "notifications" && "Lista wszystkich powiadomień"}
                {currentView === "notification-details" && "Szczegóły powiadomienia"}
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
                minWidth: 240,
                border: "1px solid",
                borderColor: "divider",
                display: "grid",
                gap: 1,
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

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  mt: 0.5,
                }}
              >
                <Button
                  variant={currentView === "dashboard" ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setCurrentView("dashboard")}
                >
                  Dashboard
                </Button>

                <Button
                  variant={currentView !== "dashboard" ? "contained" : "outlined"}
                  size="small"
                  onClick={openNotificationsView}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <span>Powiadomienia</span>
                  </Badge>
                </Button>
              </Box>

              <Box sx={{ mt: 0.5 }}>
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

          {currentView === "dashboard" && (
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
                  errors={formErrors}
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
          )}

          {currentView === "notifications" && (
            <NotificationsList
              notifications={notifications}
              onOpen={handleOpenNotification}
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onBackToDashboard={() => setCurrentView("dashboard")}
            />
          )}

          {currentView === "notification-details" && (
            <NotificationDetails
              notification={selectedNotification}
              onBack={openNotificationsView}
              onMarkAsRead={handleMarkNotificationAsRead}
            />
          )}
        </Container>
      </Box>

      <NotificationDialog
        open={dialogOpen}
        notification={dialogNotification}
        onClose={() => {
          setDialogOpen(false);
          setDialogNotification(null);
          refreshData();
        }}
        onOpenDetails={(notificationId) => {
          setDialogOpen(false);
          setDialogNotification(null);
          handleOpenNotification(notificationId);
        }}
      />
    </ThemeProvider>
  );
}

export default App;