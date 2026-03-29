/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Log from "./pages/Log";
import Partner from "./pages/Partner";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import { initializeNativePlugins } from "./lib/native";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    initializeNativePlugins();
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="blossom-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Home />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="log" element={<Log />} />
              <Route path="partner" element={<Partner />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
