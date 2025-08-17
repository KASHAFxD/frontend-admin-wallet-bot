import React from "react";
import { useQuery } from "react-query";
import { Box, Typography, Grid, Paper, CircularProgress } from "@mui/material";
import apiClient from "../api/api";

export default function Dashboard() {
  const { data, error, isLoading } = useQuery(
    "dashboardStats",
    async () => {
      const res = await apiClient.get("/api/admin/dashboard");
      return res.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchOnWindowFocus: false,
    }
  );

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
        Error loading dashboard data.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{data.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Active Campaigns</Typography>
            <Typography variant="h4">{data.activeCampaigns}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Pending Withdrawals</Typography>
            <Typography variant="h4">{data.pendingWithdrawals}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Gift Codes</Typography>
            <Typography variant="h4">{data.totalGiftCodes}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
