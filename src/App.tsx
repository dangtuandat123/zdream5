import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "@/pages/LandingPage";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { AppShell } from "@/components/layout/AppShell";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { GeneratePage } from "@/components/generate/GeneratePage";
import { TemplatesPage } from "@/components/templates/TemplatesPage";
import { LibraryPage } from "@/components/library/LibraryPage";
import { TemplateDetailPage } from "@/components/templates/TemplateDetailPage";
import { TopUpPage } from "@/components/topup/TopUpPage";
import { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute"
import { GoogleCallback } from "@/components/auth/GoogleCallback";

function App() {
  return (
    <Router>
      <Toaster theme="dark" position="top-right" richColors closeButton />
      <Routes>

        {/* Public Routes with standard Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth Routes (No layout, full screen) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Google OAuth Callback */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        {/* Protected App Routes with Sidebar Shell */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/home" replace />} />
            <Route path="home" element={<Dashboard />} />
            <Route path="generate" element={<GeneratePage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="templates/:id" element={<TemplateDetailPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="topup" element={<TopUpPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;

