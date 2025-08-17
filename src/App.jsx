import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout/Layout";

// All admin pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Campaigns from "./pages/Campaigns";
import Screenshots from "./pages/Screenshots";
import Withdrawals from "./pages/Withdrawals";
import GiftCodes from "./pages/GiftCodes";
import Channels from "./pages/Channels";
import APIKeys from "./pages/APIKeys";
import Settings from "./pages/Settings";

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/screenshots" element={<Screenshots />} />
                <Route path="/withdrawals" element={<Withdrawals />} />
                <Route path="/gift-codes" element={<GiftCodes />} />
                <Route path="/channels" element={<Channels />} />
                <Route path="/api-keys" element={<APIKeys />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
