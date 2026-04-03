import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewInspectionPage } from './pages/NewInspectionPage';
import { InspectionPage } from './pages/InspectionPage';
import { SectionPage } from './pages/SectionPage';
import { BodyDiagramPage } from './pages/BodyDiagramPage';
import { SummaryPage } from './pages/SummaryPage';
import { SellerSummaryPage } from './pages/SellerSummaryPage';
import { CustomerViewPage } from './pages/CustomerViewPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/view/:token" element={<CustomerViewPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/inspection/new" element={<ProtectedRoute><NewInspectionPage /></ProtectedRoute>} />
        <Route path="/inspection/:id" element={<ProtectedRoute><InspectionPage /></ProtectedRoute>} />
        <Route path="/inspection/:id/section/:sectionKey" element={<ProtectedRoute><SectionPage /></ProtectedRoute>} />
        <Route path="/inspection/:id/body-diagram" element={<ProtectedRoute><BodyDiagramPage /></ProtectedRoute>} />
        <Route path="/inspection/:id/summary" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
        <Route path="/inspection/:id/seller" element={<ProtectedRoute><SellerSummaryPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
