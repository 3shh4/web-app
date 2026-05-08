import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

interface GuestWaitingViewProps {
  onLogout: () => void;
}

export function GuestWaitingView({ onLogout }: GuestWaitingViewProps) {
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
          maxWidth: 540,
          borderRadius: 5,
          boxShadow: 6,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
                Konto oczekuje na zatwierdzenie
              </Typography>

              <Typography color="text.secondary">
                Twoje konto zostało utworzone, ale ma jeszcze rolę guest.
                Administrator musi nadać Ci odpowiednią rolę, aby uzyskać dostęp
                do aplikacji.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={onLogout}>
                Wyloguj
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}