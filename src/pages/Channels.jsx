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

export default function Channels() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [formValues, setFormValues] = useState({ name: "", description: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Fetch channels
  const { data, isLoading, error } = useQuery("channels", async () => {
    const res = await apiClient.get("/api/admin/channels");
    return res.data || [];
  });

  // Mutation: create or update channel
  const saveMutation = useMutation(
    (channel) => {
      if (selectedChannel) {
        return apiClient.put(`/api/admin/channels/${selectedChannel.id}`, channel);
      } else {
        return apiClient.post("/api/admin/channels", channel);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("channels");
        setSnackbar({ open: true, message: selectedChannel ? "Channel updated" : "Channel created" });
        closeDialog();
      },
      onError: () => {
        setSnackbar({ open: true, message: "Error saving channel" });
      },
    }
  );

  // Mutation: delete channel
  const deleteMutation = useMutation(
    (id) => apiClient.delete(`/api/admin/channels/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("channels");
        setSnackbar({ open: true, message: "Channel deleted" });
      },
      onError: () => {
        setSnackbar({ open: true, message: "Error deleting channel" });
      },
    }
  );

  const openDialogForNew = () => {
    setSelectedChannel(null);
    setFormValues({ name: "", description: "" });
    setDialogOpen(true);
  };

  const openDialogForEdit = (channel) => {
    setSelectedChannel(channel);
    setFormValues({ name: channel.name, description: channel.description });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (field) => (e) => {
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formValues.name) {
      setSnackbar({ open: true, message: "Name is required" });
      return;
    }
    saveMutation.mutate(formValues);
  };

  if (isLoading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Typography color="error">Failed to load channels.</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Channels Management
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={openDialogForNew}>
        Add Channel
      </Button>

      <TableContainer component={Paper}>
        <Table aria-label="channels table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((channel) => (
              <TableRow key={channel.id} hover>
                <TableCell>{channel.name}</TableCell>
                <TableCell>{channel.description}</TableCell>
                <TableCell align="center">
                  <Button size="small" variant="outlined" onClick={() => openDialogForEdit(channel)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button size="small" variant="contained" color="error" onClick={() => deleteMutation.mutate(channel.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedChannel ? "Edit Channel" : "Add Channel"}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              value={formValues.name}
              onChange={handleFormChange("name")}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              multiline
              minRows={2}
              value={formValues.description}
              onChange={handleFormChange("description")}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saveMutation.isLoading}>
            {saveMutation.isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </Box>
  );
}
