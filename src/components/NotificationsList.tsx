import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import type { Notification } from "../models/Notification";

type NotificationsListProps = {
  notifications: Notification[];
  onOpen: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onBackToDashboard: () => void;
};

const priorityColorMap: Record<
  Notification["priority"],
  "default" | "warning" | "error" | "success" | "info"
> = {
  low: "default",
  medium: "warning",
  high: "error",
};

const priorityLabelMap: Record<Notification["priority"], string> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("pl-PL");
}

export default function NotificationsList({
  notifications,
  onOpen,
  onMarkAsRead,
  onMarkAllAsRead,
  onBackToDashboard,
}: NotificationsListProps) {
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Card
        elevation={2}
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6">Powiadomienia</Typography>
              <Typography variant="body2" color="text.secondary">
                Wszystkie zapisane powiadomienia użytkownika. Nieprzeczytane: {unreadCount}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button variant="outlined" onClick={onBackToDashboard}>
                Wróć do dashboardu
              </Button>
              <Button variant="contained" onClick={onMarkAllAsRead}>
                Oznacz wszystkie jako przeczytane
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {notifications.length === 0 ? (
        <Card
          elevation={2}
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent>
            <Typography variant="body1">Brak powiadomień.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              elevation={2}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: notification.isRead ? "divider" : "primary.main",
              }}
            >
              <CardContent>
                <Box sx={{ display: "grid", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ display: "grid", gap: 1 }}>
                      <Typography variant="h6">{notification.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(notification.date)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={priorityLabelMap[notification.priority]}
                        color={priorityColorMap[notification.priority]}
                        size="small"
                      />
                      <Chip
                        label={notification.isRead ? "PRZECZYTANE" : "NIEPRZECZYTANE"}
                        color={notification.isRead ? "success" : "info"}
                        size="small"
                        variant={notification.isRead ? "outlined" : "filled"}
                      />
                    </Box>
                  </Box>

                  <Divider />

                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      onClick={() => onOpen(notification.id)}
                    >
                      Otwórz szczegóły
                    </Button>

                    {!notification.isRead && (
                      <Button
                        variant="outlined"
                        onClick={() => onMarkAsRead(notification.id)}
                      >
                        Oznacz jako przeczytane
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}