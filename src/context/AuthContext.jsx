import React, { createContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

function encodeBase64(username, password) {
  return btoa(`${username}:${password}`);
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    username: null,
    password: null,
    token: null,
    isAuthenticated: false,
  });

  // Load auth from sessionStorage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    const storedUser = sessionStorage.getItem("authUser");
    const storedPass = sessionStorage.getItem("authPass");

    if (storedToken && storedUser && storedPass) {
      setAuth({
        username: storedUser,
        password: storedPass,
        token: storedToken,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = useCallback((username, password) => {
    // Basic Auth token
    const token = encodeBase64(username, password);
    sessionStorage.setItem("authToken", token);
    sessionStorage.setItem("authUser", username);
    sessionStorage.setItem("authPass", password);

    setAuth({ username, password, token, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    sessionStorage.removeItem("authPass");
    setAuth({ username: null, password: null, token: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, encodeBase64 }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
