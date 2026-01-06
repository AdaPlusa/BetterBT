import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
// Importy słowników
import CountriesPage from './pages/dictionaries/CountriesPage';
import CitiesPage from './pages/dictionaries/CitiesPage';
import HotelsPage from './pages/dictionaries/HotelsPage';
import TransportPage from './pages/dictionaries/TransportPage';
import TransportRoutesPage from './pages/dictionaries/TransportRoutesPage';
import UsersPage from './pages/admin/UsersPage';
import TripWizardPage from './pages/TripWizardPage';
import ProtectedLayout from './components/ProtectedLayout';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar został przeniesiony do ProtectedLayout */}
      <div className="container-fluid p-0">
        <Routes>
          {/* Publiczne trasy (bez Navbara) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Chronione trasy (z Navbarem i sprawdzaniem tokena) */}
          <Route element={<ProtectedLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/trip-wizard" element={<TripWizardPage />} />
              
              {/* Słowniki */}
              <Route path="/countries" element={<CountriesPage />} />
              <Route path="/cities" element={<CitiesPage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/transport" element={<TransportPage />} />
              <Route path="/routes" element={<TransportRoutesPage />} />
              <Route path="/users" element={<UsersPage />} />
              
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
