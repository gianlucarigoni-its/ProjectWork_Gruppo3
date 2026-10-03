import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

export default function MainLayout() {
  return (
    <div className="dashboard-container">
      {/* Sidebar fissa a sinistra (su mobile diventa barra in basso) */}
      <Sidebar />

      {/* Area di destra con Navbar in alto e contenuto della pagina sotto */}
      <div className="main-content">
        <Navbar />

        {/* Padding e larghezza massima arrivano da qui: le pagine NON devono
            più avvolgersi in <div className="dashboard-body"> */}
        <main className="dashboard-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
