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

import { authStorageApi } from "./api/authStorage";
import { getUsers, userStorageApi } from "./api/userStorage";
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

import { LoginView } from "./components/LoginView";
import { GuestWaitingView } from "./components/GuestWaitingView";
import { BlockedUserView } from "./components/BlockedUserView";

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
import UsersList from "./components/UsersList";

import type { User, UserRole } from "./models/User";
import type { Story } from "./models/Story";
import type { Task } from "./models/Task";
import type { Notification } from "./models/Notification";

type ThemeMode = "light" | "dark";

type AppView =
  | "dashboard"
  | "notifications"
  | "notification-details"
  | "users";

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
            main: "#4f8cff",
          },
          secondary: {
            main: "#7c8cff",
          },
          background: {
            default: themeMode === "dark" ? "#07142f" : "#f4f7fb",
            paper: themeMode === "dark" ? "#24344d" : "#ffffff",
          },
          divider:
            themeMode === "dark" ? "rgba(255,255,255,0.08)" : "#dbe4f0",
          text: {
            primary: themeMode === "dark" ? "#f8fbff" : "#102038",
            secondary: themeMode === "dark" ? "#b8c6da" : "#5f6f86",
          },
        },
        shape: {
          borderRadius: 14,
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
          h4: {
            fontWeight: 800,
            letterSpacing: -0.5,
          },
          h5: {
            fontWeight: 700,
          },
          button: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
        components: {
          MuiContainer: {
            styleOverrides: {
              root: {
                paddingLeft: 24,
                paddingRight: 24,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 18,
                border: `1px solid ${
                  themeMode === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(15,23,42,0.08)"
                }`,
                boxShadow:
                  themeMode === "dark"
                    ? "0 10px 24px rgba(0,0,0,0.22)"
                    : "0 10px 24px rgba(15,23,42,0.08)",
                backgroundImage: "none",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                paddingInline: 14,
              },
              contained: {
                boxShadow: "0 8px 20px rgba(79,140,255,0.22)",
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 14,
                backgroundColor:
                  themeMode === "dark"
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(15,23,42,0.02)",
              },
            },
          },
          MuiFormControlLabel: {
            styleOverrides: {
              root: {
                marginLeft: 0,
                marginRight: 0,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: `1px solid ${
                  themeMode === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(15,23,42,0.08)"
                }`,
              },
              head: {
                fontWeight: 700,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 700,
              },
            },
          },
        },
      }),
    [themeMode]
  );

  const [users, setUsers] = useState<User[]>(() => getUsers());

  const [loggedUser, setLoggedUser] = useState<User | null>(() => {
    const loggedUserId = authStorageApi.getLoggedUserId();

    if (!loggedUserId) {
      return null;
    }

    return userStorageApi.getUserById(loggedUserId) ?? null;
  });

  const [stories, setStories] = useState<Story[]>(() => getStories());
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const loggedUserId = authStorageApi.getLoggedUserId();

    if (!loggedUserId) {
      return [];
    }

    return getNotificationsByRecipient(loggedUserId);
  });

  const [unreadCount, setUnreadCount] = useState<number>(() => {
    const loggedUserId = authStorageApi.getLoggedUserId();

    if (!loggedUserId) {
      return 0;
    }

    return getUnreadCount(loggedUserId);
  });

  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<TaskFormErrors>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogNotification, setDialogNotification] =
    useState<Notification | null>(null);

  const formSectionRef = useRef<HTMLDivElement | null>(null);

  function handleLogin(email: string, firstName: string, lastName: string) {
    const result = userStorageApi.createOrGetUserFromGoogle({
      email,
      firstName,
      lastName,
    });

    authStorageApi.setLoggedUser(result.user);
    setLoggedUser(result.user);

    const freshUsers = getUsers();
    setUsers(freshUsers);

    setNotifications(getNotificationsByRecipient(result.user.id));
    setUnreadCount(getUnreadCount(result.user.id));

    if (result.isNewUser) {
      const admins = freshUsers.filter(
        (user) =>
          user.role === "admin" &&
          !user.isBlocked &&
          user.id !== result.user.id
      );

      admins.forEach((admin) => {
        createNotification({
          title: "Nowy użytkownik oczekuje na zatwierdzenie",
          message: `Użytkownik ${result.user.name} (${result.user.email}) zalogował się pierwszy raz i otrzymał rolę guest.`,
          priority: "high",
          recipientId: admin.id,
        });
      });
    }
  }

  function handleLogout() {
    authStorageApi.logout();
    setLoggedUser(null);
    setNotifications([]);
    setUnreadCount(0);
    setCurrentView("dashboard");
    setSelectedNotificationId(null);
  }

  function handleChangeUserRole(userId: string, role: UserRole) {
    userStorageApi.updateUserRole(userId, role);
    refreshData();
  }

  function handleBlockUser(userId: string) {
    userStorageApi.blockUser(userId);
    refreshData();
  }

  function handleUnblockUser(userId: string) {
    userStorageApi.unblockUser(userId);
    refreshData();
  }

  function refreshData() {
    const freshUsers = getUsers();

    const loggedUserId = authStorageApi.getLoggedUserId();
    const freshLoggedUser = loggedUserId
      ? userStorageApi.getUserById(loggedUserId) ?? null
      : null;

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
      selectedNotificationId
        ? getNotificationById(selectedNotificationId) ?? null
        : null,
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

  function handleFormChange(field: keyof TaskFormState, value: string | number) {
    setForm((prev: TaskFormState) => ({ ...prev, [field]: value }));

    setFormErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }

  function getStoryTitle(storyId: string) {
    return (
      stories.find((story) => story.id === storyId)?.title ??
      "Nieznana historyjka"
    );
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

  if (!loggedUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginView onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  if (loggedUser.isBlocked) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BlockedUserView onLogout={handleLogout} />
      </ThemeProvider>
    );
  }

  if (loggedUser.role === "guest") {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GuestWaitingView onLogout={handleLogout} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          py: { xs: 3, md: 5 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              mb: 4,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr auto",
              },
              gap: 2,
              alignItems: "start",
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 1.5,
                  color: "primary.main",
                  fontWeight: 700,
                }}
              >
                PROJECT MANAGEMENT APP
              </Typography>

              <Typography variant="h4">ManageMe</Typography>

              <Typography color="text.secondary">
                {currentView === "dashboard" &&
                  "Zadania, użytkownicy i tablica kanban"}
                {currentView === "notifications" &&
                  "Lista wszystkich powiadomień"}
                {currentView === "notification-details" &&
                  "Szczegóły powiadomienia"}
                {currentView === "users" && "Zarządzanie użytkownikami"}
              </Typography>
            </Box>

            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 3,
                bgcolor: "background.paper",
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                textAlign: { xs: "left", md: "right" },
                width: { xs: "100%", md: 320 },
                border: "1px solid",
                borderColor: "divider",
                display: "grid",
                gap: 0.75,
                alignSelf: "start",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                ZALOGOWANY
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>{loggedUser.name}</Typography>

              <Typography variant="caption" color="primary.main">
                {loggedUser.role}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 0.75,
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  flexWrap: "wrap",
                  mt: 1,
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
                  variant={
                    currentView === "notifications" ||
                    currentView === "notification-details"
                      ? "contained"
                      : "outlined"
                  }
                  size="small"
                  onClick={openNotificationsView}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <span>Powiadomienia</span>
                  </Badge>
                </Button>

                {loggedUser.role === "admin" && (
                  <Button
                    variant={currentView === "users" ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setCurrentView("users")}
                  >
                    Użytkownicy
                  </Button>
                )}

                <Button variant="outlined" size="small" onClick={handleLogout}>
                  Wyloguj
                </Button>
              </Box>

              <Box
                sx={{
                  mt: 0.5,
                  display: "flex",
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={themeMode === "dark"}
                      onChange={() =>
                        setThemeMode((prev) =>
                          prev === "light" ? "dark" : "light"
                        )
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
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "320px minmax(0, 1fr)",
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
                  setSelectedTaskId((prev) =>
                    prev === task.id ? null : task.id
                  )
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

          {currentView === "users" && loggedUser.role === "admin" && (
            <UsersList
              users={users}
              currentUser={loggedUser}
              onChangeRole={handleChangeUserRole}
              onBlockUser={handleBlockUser}
              onUnblockUser={handleUnblockUser}
              onBackToDashboard={() => setCurrentView("dashboard")}
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