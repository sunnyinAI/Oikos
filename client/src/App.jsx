import { useEffect } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import AssistantPage from './pages/AssistantPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import FinancePage from './pages/FinancePage';
import GroceryPage from './pages/GroceryPage';
import JoinListPage from './pages/JoinListPage';
import MandiPage from './pages/MandiPage';
import MealsPage from './pages/MealsPage';
import PantryPage from './pages/PantryPage';
import PricesPage from './pages/PricesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/auth/LoginPage';
import OtpPage from './pages/auth/OtpPage';
import { useAuthStore } from './store/useAuthStore';
import { useUIStore } from './store/useUIStore';

function SyncUserPreferences() {
  const user = useAuthStore((state) => state.user);
  const setDarkMode = useUIStore((state) => state.setDarkMode);
  const setLanguage = useUIStore((state) => state.setLanguage);

  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language);
    }

    if (user?.dark_mode !== undefined && user?.dark_mode !== null) {
      setDarkMode(Boolean(user.dark_mode));
    }
  }, [setDarkMode, setLanguage, user?.dark_mode, user?.language]);

  return null;
}

function RequireAuth() {
  const token =
    useAuthStore((state) => state.token) || localStorage.getItem('kharcha_token');
  const onboardingComplete = useUIStore((state) => state.onboardingComplete);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

function GuestOnly() {
  const token =
    useAuthStore((state) => state.token) || localStorage.getItem('kharcha_token');

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function NotFoundRedirect() {
  const token =
    useAuthStore((state) => state.token) || localStorage.getItem('kharcha_token');

  return <Navigate to={token ? '/' : '/login'} replace />;
}

export default function App() {
  return (
    <>
      <SyncUserPreferences />
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp" element={<OtpPage />} />
        </Route>

        <Route path="/join/:shareCode" element={<JoinListPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="/grocery" element={<GroceryPage />} />
            <Route path="/prices" element={<PricesPage />} />
            <Route path="/pantry" element={<PantryPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/mandi" element={<MandiPage />} />
            <Route path="/meals" element={<MealsPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </>
  );
}
