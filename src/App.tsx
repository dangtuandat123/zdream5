import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { AppShell } from "@/components/layout/AppShell";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { StudioWorkspace } from "@/components/studio/StudioWorkspace";
import { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes with standard Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth Routes (No layout, full screen) protected from logged-in users */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected App Routes with AppShell */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="studio" element={<StudioWorkspace />} />
            <Route path="billing" element={<div className="p-8 text-white/50 text-center mt-20">Trang quản lý gói cước (Coming Soon)</div>} />
            <Route path="settings" element={<div className="p-8 text-white/50 text-center mt-20">Trang cài đặt (Coming Soon)</div>} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
