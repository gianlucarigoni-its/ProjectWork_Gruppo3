import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import { api } from "../utils/services/api";

// Stessi campi che usa la Home. Fa una chiamata in più: in futuro si può
// spostare in un context condiviso.
function useNomeUtente() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/accounts/home", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const d = res.data?.account || res.data?.user || res.data || {};
        const n = d.firstName || d.nome || d.username || "";
        const c = d.lastName || d.cognome || "";
        setNome(`${n} ${c}`.trim());
      })
      .catch(() => {}); // errori e 401 li gestisce già la pagina
  }, []);

  return nome;
}

const iniziali = (nome: string) =>
  nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

export default function Navbar() {
  const navigate = useNavigate();
  const nome = useNomeUtente();
  const [aperto, setAperto] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Chiude il menu con click fuori o tasto Esc
  useEffect(() => {
    if (!aperto) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setAperto(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAperto(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [aperto]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="top-navbar">
      <Link to="/home" className="navbar-brand">
        3Vision <span>DigitalBank</span>
      </Link>

      <div className="profile-wrapper" ref={wrapperRef}>
        <button
          type="button"
          className="profile-btn"
          onClick={() => setAperto((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={aperto}
          aria-label="Menu utente"
        >
          {nome && <span className="profile-name">{nome}</span>}
          <span className="avatar">{iniziali(nome)}</span>
          <ChevronDown size={16} className="chevron" aria-hidden="true" />
        </button>

        {aperto && (
          <div className="profile-dropdown" role="menu">
            <div className="dropdown-user-info">
              <p className="user-name">{nome || "Il mio account"}</p>
            </div>
            <hr />
            <Link
              to="/profilo"
              className="dropdown-item"
              role="menuitem"
              onClick={() => setAperto(false)}
            >
              <User size={16} aria-hidden="true" /> Il mio profilo
            </Link>
            <button type="button" className="dropdown-item logout" role="menuitem" onClick={logout}>
              <LogOut size={16} aria-hidden="true" /> Esci
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
