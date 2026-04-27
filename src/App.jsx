import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import VisitationPlanPage from './pages/VisitationPlanPage';
import UpdateLocationPage from './pages/UpdateLocationPage';
import VisitTestPage from './pages/VisitTestPage';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import MobileLayout from './pages/mobile/MobileLayout';
import MobileHomePage from './pages/mobile/MobileHomePage';
import OutletDetailPage from './pages/mobile/OutletDetailPage';
import AttendancePage from './pages/mobile/AttendancePage';
import ProfilePage from './pages/mobile/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Mobile App */}
        <Route
          path="/mobile"
          element={
            <ProtectedRoute>
              <MobileLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MobileHomePage />} />
          <Route path="outlet/:outletId" element={<OutletDetailPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Desktop Dashboard */}
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

        <Route path="*" element={<Navigate to="/mobile" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
