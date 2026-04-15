import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { Notification } from "../models/Notification";

type NotificationDialogProps = {
  open: boolean;
  notification: Notification | null;
  onClose: () => void;
  onOpenDetails: (notificationId: string) => void;
};

const priorityColorMap: Record<
  Notification["priority"],
  "default" | "warning" | "error" | "success" | "info"
> = {
  low: "default",
  medium: "warning",
  high: "error",
};

export default function NotificationDialog({
  open,
  notification,
  onClose,
  onOpenDetails,
}: NotificationDialogProps) {
  if (!notification) return null;

  const handleClose = () => {
    onClose();
  };

  const handleOpenDetails = () => {
    onOpenDetails(notification.id);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <span>Nowe powiadomienie</span>
          <Chip
            label={notification.priority.toUpperCase()}
            color={priorityColorMap[notification.priority]}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 1.5 }}>
          <Typography variant="h6">{notification.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(notification.date).toLocaleString("pl-PL")}
          </Typography>
          <Typography variant="body1">{notification.message}</Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Zamknij</Button>
        <Button variant="contained" onClick={handleOpenDetails}>
          Otwórz szczegóły
        </Button>
      </DialogActions>
    </Dialog>
  );
}