import { Card, CardContent, Chip, Typography, Box } from "@mui/material";
import type { Task } from "../models/Task";

type KanbanBoardProps = {
  todoTasks: Task[];
  doingTasks: Task[];
  doneTasks: Task[];
};

type KanbanColumnProps = {
  title: string;
  tasks: Task[];
};

function KanbanColumn({ title, tasks }: KanbanColumnProps) {
  return (
    <Card elevation={3} sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{title}</Typography>
            <Chip label={tasks.length} size="small" />
          </Box>

          {tasks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Brak zadań
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {tasks.map((task) => (
                <Card key={task.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "grid", gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600 }}
                      >
                        {task.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {task.description || "Brak opisu"}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={task.priority.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function KanbanBoard({
  todoTasks,
  doingTasks,
  doneTasks,
}: KanbanBoardProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(3, 1fr)",
        },
      }}
    >
      <KanbanColumn title="TO DO" tasks={todoTasks} />
      <KanbanColumn title="DOING" tasks={doingTasks} />
      <KanbanColumn title="DONE" tasks={doneTasks} />
    </Box>
  );
}