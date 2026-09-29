import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import Navbar from './navbar';

export default function MainLayout() {
  return (
    <div className="app-container">
      {/* Sidebar fissa a sinistra */}
      <Sidebar />

      {/* Area di destra con Navbar in alto e contenuto della pagina sotto */}
      <div className="main-content">
        <Navbar userName="Daniel Crudu" />
        
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}