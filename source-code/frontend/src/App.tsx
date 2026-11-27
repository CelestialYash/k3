import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './stores/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { DocumentRepositoryPage } from './pages/DocumentRepository/DocumentRepositoryPage';
import { UploadDocumentsPage } from './pages/UploadDocuments/UploadDocumentsPage';
import { AIAssistantPage } from './pages/AIAssistant/AIAssistantPage';
import { DocumentProcessingPage } from './pages/DocumentProcessing/DocumentProcessingPage';
import { VerificationCenterPage } from './pages/VerificationCenter/VerificationCenterPage';
import { ReportGeneratorPage } from './pages/ReportGenerator/ReportGeneratorPage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { UserManagementPage } from './pages/UserManagement/UserManagementPage';
import { AuditLogsPage } from './pages/AuditLogs/AuditLogsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface-variant">
        Loading GeoStratum Intelligence...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/repository" element={<ProtectedRoute><DocumentRepositoryPage /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadDocumentsPage /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
          <Route path="/processing" element={<ProtectedRoute><DocumentProcessingPage /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute><VerificationCenterPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportGeneratorPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
