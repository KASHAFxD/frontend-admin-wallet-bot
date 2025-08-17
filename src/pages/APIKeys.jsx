import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from "@mui/material";
import apiClient from "../api/api";

export default function APIKeys() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Fetch API keys
  const { data, isLoading, error } = useQuery("apiKeys", async () => {
    const res = await apiClient.get("/api/admin/api-keys");
    return res.data || [];
  });

  // Mutation: create API key
  const createMutation = useMutation(
    (name) => apiClient.post("/api/admin/api-keys", { name }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("apiKeys");
        setSnackbar({ open: true, message: "API Key created" });
        setDialogOpen(false);
        setNewKeyName("");
      },
      onError: () => {
        setSnackbar({ open: true, message: "Error creating API Key" });
      },
    }
  );

  // Mutation: delete API key
  const deleteMutation = useMutation(
    (id) => apiClient.delete(`/api/admin/api-keys/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("apiKeys");
        setSnackbar({ open: true, message: "API Key deleted" });
      },
      onError: () => {
        setSnackbar({ open: true, message: "Error deleting API Key" });
      },
    }
  );

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setNewKeyName("");
  };

  const handleCreate = () => {
    if (!newKeyName.trim()) {
      setSnackbar({ open: true, message: "Please enter a name" });
      return;
    }
    createMutation.mutate(newKeyName.trim());
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
        Error loading API Keys.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        API Keys Management
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={openDialog}>
        Generate New API Key
      </Button>

      <TableContainer component={Paper}>
        <Table aria-label="api keys table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Key</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((key) => (
              <TableRow key={key.id} hover>
                <TableCell>{key.name}</TableCell>
                <TableCell>{key.apiKey}</TableCell>
                <TableCell>{new Date(key.createdAt).toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => deleteMutation.mutate(key.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog to create new API key */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Generate API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleCreate} disabled={createMutation.isLoading}>
            {createMutation.isLoading ? "Generating..." : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </Box>
  );
}
