import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import CampaignIcon from "@mui/icons-material/Campaign";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import PaymentIcon from "@mui/icons-material/Payment";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import SettingsIcon from "@mui/icons-material/Settings";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Users", icon: <PeopleIcon />, path: "/users" },
  { text: "Campaigns", icon: <CampaignIcon />, path: "/campaigns" },
  { text: "Screenshots", icon: <PhotoLibraryIcon />, path: "/screenshots" },
  { text: "Withdrawals", icon: <PaymentIcon />, path: "/withdrawals" },
  { text: "Gift Codes", icon: <CardGiftcardIcon />, path: "/gift-codes" },
  { text: "Channels", icon: <GroupWorkIcon />, path: "/channels" },
  { text: "API Keys", icon: <VpnKeyIcon />, path: "/api-keys" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

export default function Sidebar({ open, drawerWidth }) {
  const location = useLocation();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map(({ text, icon, path }) => (
          <ListItem
            button
            key={text}
            component={Link}
            to={path}
            selected={location.pathname === path}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
