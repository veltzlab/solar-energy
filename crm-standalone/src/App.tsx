import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CrmDashboard } from './pages/CrmDashboard';
import { CrmLogin } from './pages/CrmLogin';
import { useAuthStore } from './store/useAuthStore';

function ProtectedCrm() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <CrmDashboard /> : <CrmLogin />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/crm" replace />} />
        <Route path="/crm" element={<ProtectedCrm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
