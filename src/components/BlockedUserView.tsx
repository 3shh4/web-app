import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

interface BlockedUserViewProps {
  onLogout: () => void;
}

export function BlockedUserView({ onLogout }: BlockedUserViewProps) {
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
                Konto zablokowane
              </Typography>

              <Typography color="text.secondary">
                Twoje konto zostało zablokowane przez administratora. Nie masz
                dostępu do aplikacji.
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