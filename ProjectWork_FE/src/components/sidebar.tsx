import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, ArrowLeftRight, Send, Settings } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/home', icon: <Home size={20} /> },
    { label: 'Ricarica', path: '/ricarica', icon: <Wallet size={20} /> },
    { label: 'Movimenti', path: '/movimenti', icon: <ArrowLeftRight size={20} /> },
    { label: 'Bonifico', path: '/bonifico', icon: <Send size={20} /> },
    { label: 'Impostazioni', path: '/modifica-password', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/img/3Vision_DigitalBank_LogoRMBG_white.png" alt="3Vision Logo" />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}