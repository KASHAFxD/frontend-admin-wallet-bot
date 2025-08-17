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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import apiClient from "../api/api";

export default function GiftCodes() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCodeAmount, setNewCodeAmount] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Fetch gift codes
  const { data, isLoading, error } = useQuery("giftCodes", async () => {
    const res = await apiClient.get("/api/admin/gift-codes");
    return res.data || [];
  });

  // Mutation: create gift code
  const createMutation = useMutation(
    (amount) => apiClient.post("/api/admin/gift-codes", { amount: Number(amount) }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("giftCodes");
        setSnackbar({ open: true, message: "Gift code created" });
        setDialogOpen(false);
        setNewCodeAmount("");
      },
      onError: () => {
        setSnackbar({ open: true, message: "Error creating gift code" });
      },
    }
  );

  // Mutation: delete gift code
  const deleteMutation = useMutation(
    (id) => apiClient.delete(`/api/admin/gift-codes/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("giftCodes");
        setSnackbar({ open: true, message: "Gift code deleted" });
      },
      onError: () => {
        setSnackbar({ open: true, message: "Error deleting gift code" });
      },
    }
  );

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setNewCodeAmount("");
  };

  const handleCreate = () => {
    if (!newCodeAmount || isNaN(newCodeAmount) || Number(newCodeAmount) <= 0) {
      setSnackbar({ open: true, message: "Enter a valid amount" });
      return;
    }
    createMutation.mutate(newCodeAmount);
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
        Error loading gift codes.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gift Codes Management
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={openDialog}>
        Generate New Gift Code
      </Button>

      <TableContainer component={Paper}>
        <Table aria-label="gift codes table">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((code) => (
              <TableRow key={code.id} hover>
                <TableCell>{code.code}</TableCell>
                <TableCell>₹{code.amount}</TableCell>
                <TableCell>{new Date(code.createdAt).toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => deleteMutation.mutate(code.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog to create new code */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Generate Gift Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newCodeAmount}
            onChange={(e) => setNewCodeAmount(e.target.value)}
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
