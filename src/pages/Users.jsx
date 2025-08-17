import React from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import apiClient from "../api/api";

export default function Users() {
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = React.useState(null);
  const [walletAmount, setWalletAmount] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  // Fetch users list
  const { data, error, isLoading } = useQuery("users", async () => {
    const res = await apiClient.get("/api/admin/users");
    return res.data;
  });

  // Ban / Unban mutation
  const banUnbanMutation = useMutation(
    async ({ userId, ban }) => {
      return apiClient.post(`/api/admin/users/${userId}/ban`, { ban });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
        setSnackbarMessage("User ban status updated");
        setSnackbarOpen(true);
      },
    }
  );

  // Wallet adjustment mutation
  const walletMutation = useMutation(
    async ({ userId, amount }) => {
      return apiClient.post(`/api/admin/users/${userId}/wallet`, { amount: Number(amount) });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
        setSnackbarMessage("Wallet adjusted successfully");
        setSnackbarOpen(true);
        setIsDialogOpen(false);
      },
    }
  );

  const handleBanToggle = (user) => {
    banUnbanMutation.mutate({ userId: user.id, ban: !user.isBanned });
  };

  const openWalletDialog = (user) => {
    setSelectedUser(user);
    setWalletAmount("");
    setIsDialogOpen(true);
  };

  const closeWalletDialog = () => {
    setSelectedUser(null);
    setIsDialogOpen(false);
  };

  const handleWalletSubmit = () => {
    if (walletAmount === "" || isNaN(walletAmount)) {
      setSnackbarMessage("Enter a valid numeric amount");
      setSnackbarOpen(true);
      return;
    }
    walletMutation.mutate({ userId: selectedUser.id, amount: walletAmount });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="h6" align="center" sx={{ mt: 10 }}>
        Error loading users data.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Users Management
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Wallet Balance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.walletBalance}</TableCell>
                <TableCell>{user.isBanned ? "Banned" : "Active"}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color={user.isBanned ? "success" : "error"}
                    onClick={() => handleBanToggle(user)}
                    sx={{ mr: 1 }}
                  >
                    {user.isBanned ? "Unban" : "Ban"}
                  </Button>
                  <Button variant="outlined" onClick={() => openWalletDialog(user)}>
                    Adjust Wallet
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Wallet Adjustment Dialog */}
      <Dialog open={isDialogOpen} onClose={closeWalletDialog}>
        <DialogTitle>Adjust Wallet for {selectedUser?.username}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={walletAmount}
            onChange={(e) => setWalletAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeWalletDialog}>Cancel</Button>
          <Button onClick={handleWalletSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
