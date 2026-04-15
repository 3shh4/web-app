import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Task } from "../models/Task";

type TaskTableProps = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onSelect: (task: Task) => void;
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

const getPriorityColor = (priority: Task["priority"]) => {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "default";
  }
};

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "todo":
      return "default";
    case "doing":
      return "info";
    case "done":
      return "success";
    default:
      return "default";
  }
};

export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onSelect,
}: TaskTableProps) {
  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Lista zadań
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Przegląd wszystkich zadań wraz z aktualnym statusem.
        </Typography>

        {tasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Brak zadań.
          </Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nazwa</TableCell>
                  <TableCell>Priorytet</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Akcje</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>{task.name}</TableCell>

                    <TableCell>
                      <Chip
                        label={task.priority.toUpperCase()}
                        color={getPriorityColor(task.priority)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={mapStatusLabel(task.status)}
                        color={getStatusColor(task.status)}
                        size="small"
                        variant={task.status === "todo" ? "outlined" : "filled"}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <IconButton onClick={() => onSelect(task)}>
                          <VisibilityIcon />
                        </IconButton>

                        <IconButton onClick={() => onEdit(task)}>
                          <EditIcon />
                        </IconButton>

                        <IconButton color="error" onClick={() => onDelete(task.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}