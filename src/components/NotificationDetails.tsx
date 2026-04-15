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

type NotificationDetailsProps = {
  notification: Notification | null;
  onBack: () => void;
  onMarkAsRead: (notificationId: string) => void;
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

export default function NotificationDetails({
  notification,
  onBack,
  onMarkAsRead,
}: NotificationDetailsProps) {
  if (!notification) {
    return (
      <Card
        elevation={2}
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Szczegóły powiadomienia
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nie znaleziono powiadomienia.
          </Typography>
          <Button variant="outlined" onClick={onBack}>
            Wróć do listy
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={2}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
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
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {notification.title}
              </Typography>
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
              />
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Treść
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {notification.message}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={onBack}>
              Wróć do listy
            </Button>

            {!notification.isRead && (
              <Button
                variant="contained"
                onClick={() => onMarkAsRead(notification.id)}
              >
                Oznacz jako przeczytane
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}