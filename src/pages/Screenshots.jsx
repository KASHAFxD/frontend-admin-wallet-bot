import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import apiClient from "../api/api";

export default function Screenshots() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Fetch screenshots
  const { data, error, isLoading } = useQuery("screenshots", async () => {
    const res = await apiClient.get("/api/admin/screenshots/pending");
    return res.data || [];
  });

  // Mutation for approve/reject
  const approveRejectMutation = useMutation(
    ({ ids, approve }) =>
      apiClient.post("/api/admin/screenshots/review", { ids, approve }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("screenshots");
        setSelectedIds([]);
        setSnackbar({ open: true, message: "Action completed successfully" });
      },
      onError: () => {
        setSnackbar({ open: true, message: "Action failed" });
      },
    }
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((item) => item.id));
    }
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
        Error loading screenshots.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Screenshot Reviews
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={selectedIds.length === data.length && data.length > 0}
            onChange={selectAll}
          />
        }
        label="Select All"
      />
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          disabled={selectedIds.length === 0}
          onClick={() => approveRejectMutation.mutate({ ids: selectedIds, approve: true })}
        >
          Approve Selected
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={selectedIds.length === 0}
          onClick={() => approveRejectMutation.mutate({ ids: selectedIds, approve: false })}
        >
          Reject Selected
        </Button>
      </Box>
      <Grid container spacing={2}>
        {data.map(({ id, url, userId, createdAt }) => (
          <Grid item xs={12} sm={6} md={3} key={id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={url}
                alt={`Screenshot ${id}`}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  User ID: {userId}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Uploaded: {new Date(createdAt).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => approveRejectMutation.mutate({ ids: [id], approve: true })}>
                  Approve
                </Button>
                <Button size="small" color="error" onClick={() => approveRejectMutation.mutate({ ids: [id], approve: false })}>
                  Reject
                </Button>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedIds.includes(id)}
                      onChange={() => toggleSelect(id)}
                    />
                  }
                  label="Select"
                />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}
