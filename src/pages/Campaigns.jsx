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

export default function Campaigns() {
  const queryClient = useQueryClient();

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    rewardAmount: "",
    status: "active",
    instructions: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [loading, setLoading] = useState(false);

  // Fetch campaigns using react-query
  const { data, error, isLoading } = useQuery("campaigns", async () => {
    const res = await apiClient.get("/api/admin/campaigns");
    return res.data.campaigns || [];
  });

  // Setup mutation for add/edit campaign
  const campaignMutation = useMutation(
    (newData) => {
      if (selectedCampaign) {
        return apiClient.put(`/api/admin/campaigns/${selectedCampaign.campaignId}`, newData);
      } else {
        return apiClient.post("/api/admin/campaigns", newData);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("campaigns");
        setSnackbar({ open: true, message: selectedCampaign ? "Campaign updated" : "Campaign created" });
        closeDialog();
      },
      onError: () => {
        setSnackbar({ open: true, message: "Error saving campaign" });
      },
    }
  );

  // Mutation: delete campaign
  const deleteMutation = useMutation(
    (id) => apiClient.delete(`/api/admin/campaigns/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("campaigns");
        setSnackbar({ open: true, message: "Campaign deleted" });
      },
      onError: () => {
        setSnackbar({ open: true, message: "Error deleting campaign" });
      },
    }
  );

  const openDialogForNew = () => {
    setSelectedCampaign(null);
    setFormValues({
      name: "",
      description: "",
      rewardAmount: "",
      status: "active",
      instructions: "",
    });
    setDialogOpen(true);
  };

  const openDialogForEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setFormValues({
      name: campaign.name,
      description: campaign.description,
      rewardAmount: campaign.rewardAmount,
      status: campaign.status,
      instructions: campaign.instructions || "",
    });
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
    if (!formValues.name || !formValues.description || !formValues.rewardAmount) {
      setSnackbar({ open: true, message: "Name, description and reward are required" });
      return;
    }
    campaignMutation.mutate({
      name: formValues.name,
      description: formValues.description,
      rewardAmount: parseFloat(formValues.rewardAmount),
      status: formValues.status,
      instructions: formValues.instructions,
    });
  };

  if (isLoading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Typography color="error">Failed to load campaigns.</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Campaign Management
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={openDialogForNew}>
        Add Campaign
      </Button>

      <TableContainer component={Paper}>
        <Table aria-label="campaigns table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Reward</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((c) => (
              <TableRow key={c.campaignId} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell>₹{c.rewardAmount}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>{c.description}</TableCell>
                <TableCell align="center">
                  <Button size="small" variant="outlined" onClick={() => openDialogForEdit(c)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button size="small" variant="contained" color="error" onClick={() => deleteMutation.mutate(c.campaignId)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCampaign ? "Edit Campaign" : "Add Campaign"}</DialogTitle>
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
              required
              fullWidth
              label="Description"
              multiline
              minRows={2}
              value={formValues.description}
              onChange={handleFormChange("description")}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Reward Amount"
              type="number"
              inputProps={{ step: "0.01" }}
              value={formValues.rewardAmount}
              onChange={handleFormChange("rewardAmount")}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Instructions"
              multiline
              minRows={2}
              value={formValues.instructions}
              onChange={handleFormChange("instructions")}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Status"
              select
              SelectProps={{ native: true }}
              value={formValues.status}
              onChange={handleFormChange("status")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={campaignMutation.isLoading}>
            {campaignMutation.isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </Box>
  );
}
