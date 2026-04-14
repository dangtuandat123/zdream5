import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import { Login } from "@/components/auth/Login";
import { AppShell } from "@/components/layout/AppShell";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { GeneratePage } from "@/components/generate/GeneratePage";
import { TemplatesPage } from "@/components/templates/TemplatesPage";
import { LibraryPage } from "@/components/library/LibraryPage";
import { TemplateDetailPage } from "@/components/templates/TemplateDetailPage";
import { TopUpPage } from "@/components/topup/TopUpPage";
import { AIToolsLayout, AIToolsIndex } from "@/components/tools/AIToolsLayout";
import { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute"
import { GoogleCallback } from "@/components/auth/GoogleCallback";
import AdminRoute from "@/components/auth/AdminRoute";
import { lazy, Suspense } from "react";

// Lazy load tool pages
const StyleTransferPage = lazy(() => import("@/components/tools/StyleTransferPage").then(m => ({ default: m.StyleTransferPage })));
const ImageEditPage = lazy(() => import("@/components/tools/ImageEditPage").then(m => ({ default: m.ImageEditPage })));
const UpscalePage = lazy(() => import("@/components/tools/UpscalePage").then(m => ({ default: m.UpscalePage })));
const RemoveBgPage = lazy(() => import("@/components/tools/RemoveBgPage").then(m => ({ default: m.RemoveBgPage })));
const ExtendPage = lazy(() => import("@/components/tools/ExtendPage").then(m => ({ default: m.ExtendPage })));
const ImageToPromptPage = lazy(() => import("@/components/tools/ImageToPromptPage").then(m => ({ default: m.ImageToPromptPage })));
const AdImagePage = lazy(() => import("@/components/tools/AdImagePage").then(m => ({ default: m.AdImagePage as React.ComponentType<any> })));

// Lazy load admin components
const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("@/components/admin/AdminUsersPage"));
const AdminTemplatesPage = lazy(() => import("@/components/admin/AdminTemplatesPage"));
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
            
            {/* Unified Secondary-Sidebar Tools Layout */}
            <Route path="tools" element={<AIToolsLayout />}>
              <Route index element={<AIToolsIndex />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="templates/:slug" element={<TemplateDetailPage />} />
              <Route path="style-transfer" element={<Suspense fallback={null}><StyleTransferPage /></Suspense>} />
              <Route path="image-edit" element={<Suspense fallback={null}><ImageEditPage /></Suspense>} />
              <Route path="upscale" element={<Suspense fallback={null}><UpscalePage /></Suspense>} />
              <Route path="remove-bg" element={<Suspense fallback={null}><RemoveBgPage /></Suspense>} />
              <Route path="extend" element={<Suspense fallback={null}><ExtendPage /></Suspense>} />
              <Route path="image-to-prompt" element={<Suspense fallback={null}><ImageToPromptPage /></Suspense>} />
              <Route path="ad-image" element={<Suspense fallback={null}><AdImagePage /></Suspense>} />
              
              {/* Redirects for merged tools */}
              <Route path="remove-object" element={<Navigate to="/app/tools/image-edit" replace />} />
              <Route path="inpainting" element={<Navigate to="/app/tools/image-edit" replace />} />
              <Route path="image-variation" element={<Navigate to="/app/tools/style-transfer" replace />} />
            </Route>

            <Route path="generate" element={<GeneratePage />} />

            {/* Redirect old /app/templates → /app/tools/templates */}
            <Route path="templates" element={<Navigate to="/app/tools/templates" replace />} />
            <Route path="templates/:slug" element={<Navigate to="/app/tools/templates" replace />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="topup" element={<TopUpPage />} />

            {/* Admin Routes */}
            <Route path="admin" element={<AdminRoute />}>
              <Route index element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
              <Route path="users" element={<Suspense fallback={null}><AdminUsersPage /></Suspense>} />
              <Route path="generate" element={<Suspense fallback={null}><AdminGeneratePage /></Suspense>} />
              <Route path="templates" element={<Suspense fallback={null}><AdminTemplatesPage /></Suspense>} />
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

