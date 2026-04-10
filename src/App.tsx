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
import { AIToolsPage } from "@/components/tools/AIToolsPage";
import { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute"
import { GoogleCallback } from "@/components/auth/GoogleCallback";
import AdminRoute from "@/components/auth/AdminRoute";
import { lazy, Suspense } from "react";

// Lazy load tool pages
const StyleTransferPage = lazy(() => import("@/components/tools/StyleTransferPage").then(m => ({ default: m.StyleTransferPage })));
const ImageVariationPage = lazy(() => import("@/components/tools/ImageVariationPage").then(m => ({ default: m.ImageVariationPage })));
const AdImagePage = lazy(() => import("@/components/tools/AdImagePage").then(m => ({ default: m.AdImagePage })));
const ConsistentCharacterPage = lazy(() => import("@/components/tools/ConsistentCharacterPage").then(m => ({ default: m.ConsistentCharacterPage })));
const UpscalePage = lazy(() => import("@/components/tools/UpscalePage").then(m => ({ default: m.UpscalePage })));
const RemoveBgPage = lazy(() => import("@/components/tools/RemoveBgPage").then(m => ({ default: m.RemoveBgPage })));
const RemoveObjectPage = lazy(() => import("@/components/tools/RemoveObjectPage").then(m => ({ default: m.RemoveObjectPage })));
const InpaintingPage = lazy(() => import("@/components/tools/InpaintingPage").then(m => ({ default: m.InpaintingPage })));
const ExtendPage = lazy(() => import("@/components/tools/ExtendPage").then(m => ({ default: m.ExtendPage })));
const ImageToPromptPage = lazy(() => import("@/components/tools/ImageToPromptPage").then(m => ({ default: m.ImageToPromptPage })));

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
            <Route path="tools" element={<AIToolsPage />} />
            <Route path="tools/templates" element={<TemplatesPage />} />
            <Route path="tools/templates/:slug" element={<TemplateDetailPage />} />
            <Route path="tools/style-transfer" element={<Suspense fallback={null}><StyleTransferPage /></Suspense>} />
            <Route path="tools/image-variation" element={<Suspense fallback={null}><ImageVariationPage /></Suspense>} />
            <Route path="tools/ad-image" element={<Suspense fallback={null}><AdImagePage /></Suspense>} />
            <Route path="tools/consistent-character" element={<Suspense fallback={null}><ConsistentCharacterPage /></Suspense>} />
            <Route path="tools/upscale" element={<Suspense fallback={null}><UpscalePage /></Suspense>} />
            <Route path="tools/remove-bg" element={<Suspense fallback={null}><RemoveBgPage /></Suspense>} />
            <Route path="tools/remove-object" element={<Suspense fallback={null}><RemoveObjectPage /></Suspense>} />
            <Route path="tools/inpainting" element={<Suspense fallback={null}><InpaintingPage /></Suspense>} />
            <Route path="tools/extend" element={<Suspense fallback={null}><ExtendPage /></Suspense>} />
            <Route path="tools/image-to-prompt" element={<Suspense fallback={null}><ImageToPromptPage /></Suspense>} />
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

