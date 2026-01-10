import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AuthCallback from "./pages/AuthCallback";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ReviewQueue from "./pages/ReviewQueue";
import HouseholdDetail from "./pages/HouseholdDetail";
import Analytics from "./pages/Analytics";
import PolicySimulation from "./pages/PolicySimulation";
import AuditLogs from "./pages/AuditLogs";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

function AppRouter() {
  const location = useLocation();

  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/review" element={<ReviewQueue />} />
          <Route path="/household/:householdId" element={<HouseholdDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/policy" element={<PolicySimulation />} />
          <Route path="/audit" element={<AuditLogs />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
