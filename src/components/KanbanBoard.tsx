import { Box, Chip, Divider, Typography } from "@mui/material";
import type { Task } from "../models/Task";

type KanbanBoardProps = {
  todoTasks: Task[];
  doingTasks: Task[];
  doneTasks: Task[];
};

type KanbanColumnProps = {
  title: string;
  tasks: Task[];
  tone: "todo" | "doing" | "done";
};

const columnToneStyles = {
  todo: {
    borderColor: "rgba(148, 163, 184, 0.28)",
    headerColor: "#cbd5e1",
    badgeBg: "rgba(148, 163, 184, 0.16)",
    topLine: "rgba(148, 163, 184, 0.55)",
  },
  doing: {
    borderColor: "rgba(56, 189, 248, 0.28)",
    headerColor: "#38bdf8",
    badgeBg: "rgba(56, 189, 248, 0.16)",
    topLine: "rgba(56, 189, 248, 0.55)",
  },
  done: {
    borderColor: "rgba(74, 222, 128, 0.28)",
    headerColor: "#4ade80",
    badgeBg: "rgba(74, 222, 128, 0.16)",
    topLine: "rgba(74, 222, 128, 0.55)",
  },
};

function getPriorityColor(priority: Task["priority"]) {
  switch (priority) {
    case "low":
      return "success";
    case "medium":
      return "warning";
    case "high":
      return "error";
    default:
      return "default";
  }
}

function KanbanColumn({ title, tasks, tone }: KanbanColumnProps) {
  const toneStyle = columnToneStyles[tone];

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: toneStyle.borderColor,
        bgcolor: "background.paper",
        overflow: "hidden",
        minHeight: 240,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid",
          borderTopColor: toneStyle.topLine,
          borderBottom: "1px solid",
          borderBottomColor: "divider",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            color: toneStyle.headerColor,
            letterSpacing: 0.3,
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            minWidth: 28,
            height: 28,
            px: 1,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: toneStyle.badgeBg,
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          {tasks.length}
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          display: "grid",
          gap: 1.25,
        }}
      >
        {tasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Brak zadań w tej kolumnie
          </Typography>
        ) : (
          tasks.map((task) => (
            <Box
              key={task.id}
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: "rgba(15, 23, 42, 0.12)",
                border: "1px solid",
                borderColor: "rgba(255,255,255,0.06)",
                transition: "transform 0.18s ease, background-color 0.18s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  bgcolor: "rgba(15, 23, 42, 0.2)",
                },
              }}
            >
              <Box sx={{ display: "grid", gap: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    wordBreak: "break-word",
                  }}
                >
                  {task.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    wordBreak: "break-word",
                    lineHeight: 1.45,
                  }}
                >
                  {task.description?.trim() || "Brak opisu"}
                </Typography>

                <Divider sx={{ opacity: 0.3 }} />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    label={task.priority.toUpperCase()}
                    size="small"
                    color={getPriorityColor(task.priority)}
                  />

                  <Typography variant="caption" color="text.secondary">
                    {task.estimatedHours}h
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
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
          md: "repeat(3, minmax(0, 1fr))",
        },
        alignItems: "start",
      }}
    >
      <KanbanColumn title="TO DO" tasks={todoTasks} tone="todo" />
      <KanbanColumn title="DOING" tasks={doingTasks} tone="doing" />
      <KanbanColumn title="DONE" tasks={doneTasks} tone="done" />
    </Box>
  );
}