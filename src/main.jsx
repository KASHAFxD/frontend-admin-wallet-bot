import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SnackbarProvider } from "notistack";
import App from "./App";

import "@mui/material/styles";
import "@mui/material";
import "@mui/icons-material";

// 🌙 (Optional) Add this for MUI's baseline CSS
import { CssBaseline } from "@mui/material";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
      <AuthProvider>
        <BrowserRouter>
          <CssBaseline />
          <App />
        </BrowserRouter>
      </AuthProvider>
    </SnackbarProvider>
  </React.StrictMode>
);
