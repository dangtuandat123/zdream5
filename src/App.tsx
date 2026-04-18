import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import { Login } from "@/components/auth/Login";
import { AppShell } from "@/components/layout/AppShell";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { GeneratePage } from "@/components/generate/GeneratePage";
import { LibraryPage } from "@/components/library/LibraryPage";
import { TopUpPage } from "@/components/topup/TopUpPage";
import { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute"
import { GoogleCallback } from "@/components/auth/GoogleCallback";
import AdminRoute from "@/components/auth/AdminRoute";
import { lazy, Suspense } from "react";

// Lazy load admin components
const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("@/components/admin/AdminUsersPage"));
const AdminModelsPage = lazy(() => import("@/components/admin/AdminModelsPage"));
const AdminGeneratePage = lazy(() => import("@/components/admin/AdminGeneratePage"));
const AdminSettingsPage = lazy(() => import("@/components/admin/AdminSettingsPage"));

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>

        {/* Public Routes with standard Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth Routes (No layout, full screen) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Google OAuth Callback */}
        <Route path="/login/google/success" element={<GoogleCallback />} />

        {/* Protected App Routes with Sidebar Shell */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/home" replace />} />
            <Route path="home" element={<Dashboard />} />
            <Route path="generate" element={<GeneratePage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="topup" element={<TopUpPage />} />

            {/* Redirect cũ /app/tools/*, /app/templates/* → /app/home */}
            <Route path="tools/*" element={<Navigate to="/app/home" replace />} />
            <Route path="templates/*" element={<Navigate to="/app/home" replace />} />

            {/* Admin Routes */}
            <Route path="admin" element={<AdminRoute />}>
              <Route index element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
              <Route path="users" element={<Suspense fallback={null}><AdminUsersPage /></Suspense>} />
              <Route path="generate" element={<Suspense fallback={null}><AdminGeneratePage /></Suspense>} />
              <Route path="models" element={<Suspense fallback={null}><AdminModelsPage /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={null}><AdminSettingsPage /></Suspense>} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
