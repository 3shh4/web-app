import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import type { Task } from "../models/Task";
import type { User } from "../models/User";
import type { Story } from "../models/Story";

type TaskDetailsProps = {
  selectedTask: Task | null;
  users: User[];
  stories: Story[];
  onAssign: (taskId: string, userId: string) => void;
  onChangeStatus: (taskId: string, status: Task["status"]) => void;
  onClose: () => void;
};

const mapStatusLabel = (status: Task["status"]) => {
  switch (status) {
    case "todo":
      return "TO DO";
    case "doing":
      return "DOING";
    case "done":
      return "DONE";
    default:
      return status;
  }
};

const getStoryTitle = (storyId: string, stories: Story[]) => {
  const story = stories.find((item) => item.id === storyId);
  return story ? story.title : "Brak historyjki";
};

const getUserLabel = (userId: string | undefined, users: User[]) => {
  if (!userId) return "-";

  const user = users.find((item) => item.id === userId);
  if (!user) return "-";

  return `${user.name} (${user.role})`;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("pl-PL");
};

export default function TaskDetails({
  selectedTask,
  users,
  stories,
  onAssign,
  onChangeStatus,
  onClose,
}: TaskDetailsProps) {
  if (!selectedTask) {
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
            Szczegóły zadania
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Wybierz zadanie, aby zobaczyć szczegóły.
          </Typography>
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
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h6">{selectedTask.name}</Typography>

            <Button variant="outlined" size="small" onClick={onClose}>
              Zamknij
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={mapStatusLabel(selectedTask.status)} color="info" />
            <Chip label={selectedTask.priority.toUpperCase()} variant="outlined" />
          </Box>

          <Divider />

          <div>
            <Typography variant="subtitle2">Opis</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedTask.description}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2">Historyjka</Typography>
            <Typography variant="body2" color="text.secondary">
              {getStoryTitle(selectedTask.storyId, stories)}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2">Przewidywany czas</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedTask.estimatedHours}h
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2">Zrealizowane roboczogodziny</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedTask.workedHours}h
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2">Data dodania</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(selectedTask.createdAt)}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2">Data startu</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(selectedTask.startedAt)}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2">Data zakończenia</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(selectedTask.finishedAt)}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2">Przypisana osoba</Typography>
            <Typography variant="body2" color="text.secondary">
              {getUserLabel(selectedTask.assignedUserId, users)}
            </Typography>
          </div>

          <TextField
            select
            label="Przypisz osobę"
            value={selectedTask.assignedUserId ?? ""}
            onChange={(e) => onAssign(selectedTask.id, e.target.value)}
            fullWidth
          >
            <MenuItem value="">Wybierz osobę</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} ({user.role})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={selectedTask.status}
            onChange={(e) =>
              onChangeStatus(selectedTask.id, e.target.value as Task["status"])
            }
            fullWidth
          >
            <MenuItem value="todo">TO DO</MenuItem>
            <MenuItem value="doing">DOING</MenuItem>
            <MenuItem value="done">DONE</MenuItem>
          </TextField>
        </Box>
      </CardContent>
    </Card>
  );
}