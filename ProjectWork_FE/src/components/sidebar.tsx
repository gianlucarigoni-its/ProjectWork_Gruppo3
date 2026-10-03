import { NavLink, Link } from "react-router-dom";
import { Home, Wallet, ArrowLeftRight, Send } from "lucide-react";

const navItems = [
  { label: "Home", path: "/home", icon: Home },
  { label: "Bonifico", path: "/bonifico", icon: Send },
  { label: "Ricarica", path: "/ricarica", icon: Wallet },
  { label: "Movimenti", path: "/movimenti", icon: ArrowLeftRight },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/home" className="sidebar-logo" aria-label="Vai alla home">
        <img src="/img/3Vision_DigitalBank_LogoRMBG_white.png" alt="3Vision Logo" />
      </Link>

      <nav className="sidebar-nav" aria-label="Navigazione principale">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
