import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './components/pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotta principale per la Home */}
        <Route path="/home" element={<HomePage />} />

        {/* Redirect automatico dalla radice "/" a "/home" */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Rotta temporanea per il dettaglio movimento (richiesta dal Project Work) */}
        <Route
          path="/movimento/:id"
          element={
            <div className="container mt-4">
              <h2>Dettaglio Movimento</h2>
              <p>Schermata dettaglio in fase di sviluppo...</p>
            </div>
          }
        />

        {/* Fallback per percorsi non riconosciuti */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App