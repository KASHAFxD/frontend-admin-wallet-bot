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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
} from "@mui/material";
import apiClient from "../api/api";

export default function Withdrawals() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Fetch withdrawals with filter
  const { data, isLoading, error } = useQuery(
    ["withdrawals", statusFilter],
    async () => {
      const url =
        statusFilter === "all"
          ? "/api/admin/withdrawals"
          : `/api/admin/withdrawals?status=${statusFilter}`;
      const res = await apiClient.get(url);
      return res.data;
    },
    { keepPreviousData: true }
  );

  const mutation = useMutation(
    ({ id, action }) =>
      apiClient.post(`/api/admin/withdrawals/${id}/${action}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("withdrawals");
        setSnackbar({ open: true, message: "Action completed successfully" });
      },
      onError: () => {
        setSnackbar({ open: true, message: "Action failed" });
      },
    }
  );

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleAction = (id, action) => {
    mutation.mutate({ id, action });
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
        Error loading withdrawals.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Withdrawals Management
      </Typography>

      <Box sx={{ mb: 2, maxWidth: 200 }}>
        <FormControl fullWidth>
          <InputLabel>Status Filter</InputLabel>
          <Select value={statusFilter} label="Status Filter" onChange={handleStatusChange}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="withdrawals table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Requested At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((wd) => (
              <TableRow key={wd.id} hover>
                <TableCell>{wd.id}</TableCell>
                <TableCell>{wd.user}</TableCell>
                <TableCell>₹{wd.amount}</TableCell>
                <TableCell>{wd.status}</TableCell>
                <TableCell>{new Date(wd.requestedAt).toLocaleString()}</TableCell>
                <TableCell align="center">
                  {wd.status === "pending" && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleAction(wd.id, "approve")}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleAction(wd.id, "reject")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {(wd.status === "approved" || wd.status === "rejected") && (
                    <Typography variant="body2" color="textSecondary">
                      No actions available
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </Box>
  );
}
