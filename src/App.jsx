import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FleetProvider } from './context/FleetContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import TripDispatcher from './pages/TripDispatcher';
import MaintenanceLogs from './pages/MaintenanceLogs';
import DriverManagement from './pages/DriverManagement';
import Analytics from './pages/Analytics';
import FleetMap from './pages/FleetMap';

function AppLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <TopBar pathname={location.pathname} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehicleRegistry />} />
            <Route path="/trips" element={<TripDispatcher />} />
            <Route path="/maintenance" element={<MaintenanceLogs />} />
            <Route path="/drivers" element={<DriverManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/map" element={<FleetMap />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FleetProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
      </FleetProvider>
    </AuthProvider>
  );
}
