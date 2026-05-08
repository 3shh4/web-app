import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { User, UserRole } from "../models/User";

interface UsersListProps {
  users: User[];
  currentUser: User;
  onChangeRole: (userId: string, role: UserRole) => void;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onBackToDashboard: () => void;
}

const roles: UserRole[] = ["guest", "admin", "devops", "developer"];

export default function UsersList({
  users,
  currentUser,
  onChangeRole,
  onBlockUser,
  onUnblockUser,
  onBackToDashboard,
}: UsersListProps) {
  const sortedUsers = [...users].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Użytkownicy
        </Typography>

        <Typography color="text.secondary">
          Lista kont użytkowników, zmiana ról oraz blokowanie dostępu.
        </Typography>
      </Box>

      <Button
        variant="outlined"
        onClick={onBackToDashboard}
        sx={{ width: "fit-content" }}
      >
        Wróć do dashboardu
      </Button>

      {sortedUsers.length === 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography>Brak użytkowników.</Typography>
          </CardContent>
        </Card>
      )}

      {sortedUsers.map((user) => {
        const isCurrentUser = user.id === currentUser.id;
        const isProtected = Boolean(user.isSuperAdmin);

        return (
          <Card key={user.id} sx={{ overflow: "hidden" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1.5fr 1fr auto",
                  },
                  alignItems: "center",
                }}
              >
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                      mb: 0.5,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {user.name}
                    </Typography>

                    {user.isSuperAdmin && (
                      <Chip size="small" label="super admin" color="primary" />
                    )}

                    {user.isBlocked && (
                      <Chip size="small" label="blocked" color="error" />
                    )}

                    {isCurrentUser && <Chip size="small" label="Ty" />}
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Utworzono: {new Date(user.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                <TextField
                  select
                  label="Rola"
                  value={user.role}
                  disabled={isProtected}
                  onChange={(event) =>
                    onChangeRole(user.id, event.target.value as UserRole)
                  }
                  fullWidth
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "flex-end",
                  }}
                >
                  {user.isBlocked ? (
                    <Button
                      variant="outlined"
                      color="success"
                      disabled={isProtected}
                      onClick={() => onUnblockUser(user.id)}
                    >
                      Odblokuj
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={isProtected || isCurrentUser}
                      onClick={() => onBlockUser(user.id)}
                    >
                      Zablokuj
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}