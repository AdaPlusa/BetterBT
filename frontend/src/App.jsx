import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/user/DashboardPage';
import CountriesPage from './pages/dictionaries/CountriesPage';
import CitiesPage from './pages/dictionaries/CitiesPage';
import HotelsPage from './pages/dictionaries/HotelsPage';
import TransportPage from './pages/dictionaries/TransportPage';
import TransportRoutesPage from './pages/dictionaries/TransportRoutesPage';
import UsersPage from './pages/admin/UsersPage';
import AdminTemplatesPage from './pages/admin/AdminTemplatesPage';
import TripWizardPage from './pages/wizard/TripWizardPage';
import MyTripsPage from './pages/user/MyTripsPage';
import TripDetailsPage from './pages/user/TripDetailsPage';
import SettlementPage from './pages/user/SettlementPage';
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage';
import ManagerTripDetailsPage from './pages/manager/ManagerTripDetailsPage';
import ManagerAllTripsPage from './pages/manager/ManagerAllTripsPage';

import ManagerApprovalListPage from './pages/manager/ManagerApprovalListPage';
import ManagerSettlementListPage from './pages/manager/ManagerSettlementListPage';
import ProtectedLayout from './components/ProtectedLayout';

function App() {
  return (
    <BrowserRouter>
    
      <div className="container-fluid p-0">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/trip-wizard" element={<TripWizardPage />} />
              <Route path="/my-trips" element={<MyTripsPage />} />
              <Route path="/settlement/:id" element={<SettlementPage />} />
              <Route path="/trips/:id" element={<TripDetailsPage />} />
              <Route path="/manager" element={<ManagerDashboardPage />} />
              <Route path="/manager/all-trips" element={<ManagerAllTripsPage />} />
              <Route path="/manager/approvals" element={<ManagerApprovalListPage />} />
              <Route path="/manager/settlements" element={<ManagerSettlementListPage />} />
              <Route path="/manager/approve/:id" element={<ManagerTripDetailsPage />} />
              <Route path="/manager/settle/:id" element={<ManagerTripDetailsPage />} />
              <Route path="/countries" element={<CountriesPage />} />
              <Route path="/cities" element={<CitiesPage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/transport" element={<TransportPage />} />
              <Route path="/routes" element={<TransportRoutesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/admin/templates" element={<AdminTemplatesPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
