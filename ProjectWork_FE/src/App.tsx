import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './context/authContext';
import RegisterPage from './pages/home/RegisterPage';
import LoginPage from './components/pages/loginPage';
import HomePage from './pages/home/home';
import MovimentoDettaglioPage from './pages/home/MovimentoDettaglioPage';
import ConfermaPage from './pages/home/ConfermaPage';
import RicercaMovimentiPage from './pages/home/RicercaMovimentiPage';
import ModificaPasswordPage from './pages/home/ModificaPasswordPage';
import RicaricaPage from './pages/home/Ricarica.Page' //Aggiungi/verifica il percorso del file RicaricaPage
import { TransactionsList } from './components/Transaction.List';
import ProfilePage from './pages/home/ProfilePage';
import BonificoPage from './pages/home/BonificoPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Caricamento...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const { currentUser, token } = useAuth() as any;

  const accountId = currentUser?.accountId || localStorage.getItem("accountId") || "";

  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("jwt") || undefined;

  return (
    <Routes>
      {/* Rotte Pubbliche */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/conferma/:token" element={<ConfermaPage />} />

      {/* Rotte Protette */}
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/ricarica" element={<ProtectedRoute><RicaricaPage /></ProtectedRoute>} />
      <Route path="/movimento/:id" element={<ProtectedRoute><MovimentoDettaglioPage /></ProtectedRoute>} />
      <Route path="/ricerca/:tipo" element={<ProtectedRoute><RicercaMovimentiPage /></ProtectedRoute>} />
      <Route path="/movimenti" element={<ProtectedRoute><RicercaMovimentiPage /></ProtectedRoute>} />
      <Route path="/modifica-password" element={<ProtectedRoute><ModificaPasswordPage /></ProtectedRoute>} />
      
      {/* Rotta Movimenti / Transactions */}
      <Route 
        path="/transactions" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profilo"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movimento/:id"
        element={
          <ProtectedRoute>
            <MovimentoDettaglioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ricerca/:tipo"
        element={
          <ProtectedRoute>
            <RicercaMovimentiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movimenti"
        element={
          <ProtectedRoute>
            <RicercaMovimentiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modifica-password"
        element={
          <ProtectedRoute>
            <ModificaPasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Rotta Movimenti / Transactions */}
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <TransactionsList accountId={accountId} authToken={authToken} />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: Redireziona a /home se l'utente è loggato, altrimenti a /login */}
      <Route path="/bonifico" element={<ProtectedRoute><BonificoPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
