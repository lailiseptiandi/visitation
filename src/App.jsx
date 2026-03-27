import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import VisitationPlanPage from './pages/VisitationPlanPage';
import UpdateLocationPage from './pages/UpdateLocationPage';
import VisitTestPage from './pages/VisitTestPage';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/visitation-plan" replace />} />
          <Route path="visitation-plan" element={<VisitationPlanPage />} />
          <Route path="update-location" element={<UpdateLocationPage />} />
          <Route path="visit-test" element={<VisitTestPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
