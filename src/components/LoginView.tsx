import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

interface LoginViewProps {
  onLogin: (email: string, firstName: string, lastName: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const isFormValid = email.trim() && firstName.trim() && lastName.trim();

  const handleSubmit = () => {
    if (!isFormValid) return;

    onLogin(email.trim(), firstName.trim(), lastName.trim());
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        color: "text.primary",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 5,
          boxShadow: 6,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                ManageMe
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Zaloguj się przez Google, aby przejść do aplikacji.
              </Typography>
            </Box>

            <Stack spacing={2}>
              <TextField
                label="E-mail Google"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
              />

              <TextField
                label="Imię"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                fullWidth
              />

              <TextField
                label="Nazwisko"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                fullWidth
              />
            </Stack>

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              Zaloguj przez Google
            </Button>

            <Typography variant="caption" color="text.secondary">
              LAB06: mock OAuth Google. Dane są zapisywane w localStorage.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}