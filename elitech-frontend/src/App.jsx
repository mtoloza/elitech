import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OrgChart from "./pages/OrgChart";
import OrgChartHolding from "./pages/OrgChartHolding";
import NotFound from "./pages/NotFound";
import TeamMembers from "./pages/TeamMembers";
import { Toaster } from "react-hot-toast";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route path="orgchart" element={<OrgChart />} />
              <Route path="orgchart/:region" element={<OrgChart />} />
              <Route path="team-members" element={<TeamMembers />} />
              <Route path="orgchartholding" element={<OrgChartHolding />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </I18nextProvider>
  );
}