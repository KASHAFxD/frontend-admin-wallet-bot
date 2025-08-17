import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Grid,
} from "@mui/material";
import apiClient from "../api/api";

export default function Settings() {
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    defaultRewardAmount: "",
    minWithdrawalAmount: "",
    paymentGateway: "",
    supportEmail: "",
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Fetch current settings
  const { data, isLoading, error } = useQuery("settings", async () => {
    const res = await apiClient.get("/api/admin/settings");
    return res.data;
  });

  useEffect(() => {
    if (data) {
      setSettings({
        defaultRewardAmount: data.defaultRewardAmount || "",
        minWithdrawalAmount: data.minWithdrawalAmount || "",
        paymentGateway: data.paymentGateway || "",
        supportEmail: data.supportEmail || "",
      });
    }
  }, [data]);

  // Mutation to save settings
  const mutation = useMutation(
    (newSettings) => apiClient.put("/api/admin/settings", newSettings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("settings");
        setSnackbar({ open: true, message: "Settings saved successfully" });
      },
      onError: () => {
        setSnackbar({ open: true, message: "Failed to save settings" });
      },
    }
  );

  const handleChange = (field) => (e) => {
    setSettings((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !settings.defaultRewardAmount ||
      !settings.minWithdrawalAmount ||
      !settings.paymentGateway
    ) {
      setSnackbar({ open: true, message: "Please fill all required fields" });
      return;
    }

    mutation.mutate(settings);
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
        Error loading settings.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Default Reward Amount"
                type="number"
                fullWidth
                value={settings.defaultRewardAmount}
                onChange={handleChange("defaultRewardAmount")}
                required
                inputProps={{ step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Minimum Withdrawal Amount"
                type="number"
                fullWidth
                value={settings.minWithdrawalAmount}
                onChange={handleChange("minWithdrawalAmount")}
                required
                inputProps={{ step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Payment Gateway"
                fullWidth
                value={settings.paymentGateway}
                onChange={handleChange("paymentGateway")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Support Email"
                type="email"
                fullWidth
                value={settings.supportEmail}
                onChange={handleChange("supportEmail")}
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            Save Settings
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </Box>
  );
}
