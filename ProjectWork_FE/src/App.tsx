import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './context/authContext';
import RegisterPage from './components/pages/RegisterPage';
import LoginPage from './components/pages/loginPage';
import HomePage from './components/pages/HomePage';
import MovimentoDettaglioPage from './components/pages/MovimentoDettaglioPage';
import ConfermaPage from './components/pages/ConfermaPage';
import RicercaMovimentiPage from './components/pages/RicercaMovimentiPage';
import ModificaPasswordPage from './components/pages/ModificaPasswordPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Caricamento...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/conferma/:token" element={<ConfermaPage />} />
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/movimento/:id" element={<ProtectedRoute><MovimentoDettaglioPage /></ProtectedRoute>} />
      <Route path="/ricerca/:tipo" element={<ProtectedRoute><RicercaMovimentiPage /></ProtectedRoute>} />
      <Route path="/modifica-password" element={<ProtectedRoute><ModificaPasswordPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
