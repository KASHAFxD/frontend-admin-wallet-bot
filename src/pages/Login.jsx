import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Container, Paper, Alert } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    try {
      // Try to validate creds with backend API
      const authHeader = `Basic ${btoa(username + ":" + password)}`;

      const res = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/api/admin/dashboard`,
        {
          headers: {
            Authorization: authHeader,
          },
        }
      );

      if (res.ok) {
        // Successful auth → save creds and redirect to dashboard
        login(username, password);
        navigate("/dashboard");
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ marginTop: 8 }}>
      <Paper elevation={6} sx={{ padding: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Admin Panel Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            label="Username"
            fullWidth
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <TextField
            margin="normal"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Log In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
