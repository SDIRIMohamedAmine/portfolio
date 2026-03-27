import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }         from './context/AuthContext';
import { PortfolioProvider }    from './context/PortfolioContext';
import { SiteConfigProvider }   from './context/SiteConfigContext';
import { AppearanceProvider }   from './context/AppearanceContext';
import PortfolioPage            from './pages/PortfolioPage';
import AdminLogin               from './components/admin/AdminLogin';
import AdminDashboard           from './components/admin/AdminDashboard';
import ProtectedRoute           from './components/ProtectedRoute';
import ProjectDetails           from './pages/ProjectDetails';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppearanceProvider>
          <PortfolioProvider>
            <SiteConfigProvider>
              <Routes>
                <Route path="/"            element={<PortfolioPage />} />
                <Route path="/project/:id" element={<ProjectDetails />} />
                <Route path="/admin-space/login" element={<AdminLogin />} />
                <Route path="/admin-space" element={
                  <ProtectedRoute><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SiteConfigProvider>
          </PortfolioProvider>
        </AppearanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
