import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import type { Story } from "../models/Story";
import type { TaskPriority } from "../models/Task";

export type TaskFormState = {
  name: string;
  description: string;
  priority: TaskPriority;
  storyId: string;
  estimatedHours: number;
};

type TaskFormProps = {
  form: TaskFormState;
  stories: Story[];
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof TaskFormState, value: string | number) => void;
  editingTaskId: string | null;
  onCancel?: () => void;
};

export default function TaskForm({
  form,
  stories,
  onSubmit,
  onChange,
  editingTaskId,
  onCancel,
}: TaskFormProps) {
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
          {editingTaskId ? "Edytuj zadanie" : "Dodaj zadanie"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Utwórz nowe zadanie i przypisz je do wybranej historyjki.
        </Typography>

        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            display: "grid",
            gap: 2,
          }}
        >
          <TextField
            label="Nazwa zadania"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Priorytet"
            value={form.priority}
            onChange={(e) => onChange("priority", e.target.value)}
            fullWidth
          >
            <MenuItem value="low">Niski</MenuItem>
            <MenuItem value="medium">Średni</MenuItem>
            <MenuItem value="high">Wysoki</MenuItem>
          </TextField>

          <TextField
            select
            label="Historyjka"
            value={form.storyId}
            onChange={(e) => onChange("storyId", e.target.value)}
            fullWidth
          >
            <MenuItem value="">Wybierz historyjkę</MenuItem>

            {stories.map((story) => (
              <MenuItem key={story.id} value={story.id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    gap: 2,
                  }}
                >
                  <span>{story.title}</span>
                  <Typography variant="caption" color="text.secondary">
                    {story.status.toUpperCase()}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Przewidywany czas"
            type="number"
            value={form.estimatedHours}
            onChange={(e) => onChange("estimatedHours", Number(e.target.value))}
            fullWidth
            slotProps={{ htmlInput: { min: 1 } }}
          />

          <TextField
            label="Opis zadania"
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            fullWidth
            multiline
            minRows={4}
          />

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button type="submit" variant="contained">
              {editingTaskId ? "Zapisz zmiany" : "Dodaj zadanie"}
            </Button>

            {editingTaskId && (
              <Button type="button" variant="outlined" onClick={onCancel}>
                Anuluj edycję
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}