import React from "react";
import { Box, CircularProgress } from "@mui/material";

export default function Loader({ size = 50, thickness = 4 }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <CircularProgress size={size} thickness={thickness} />
    </Box>
  );
}
