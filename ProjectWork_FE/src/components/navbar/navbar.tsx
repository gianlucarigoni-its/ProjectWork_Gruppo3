// import React from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { NavUser } from '../nav-user/NavUser';
// import { useAuth } from '../../context/AuthContext'; // O la posizione del tuo hook/servizio di Auth

// export const Navbar: React.FC = () => {
//   const { currentUser, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light">
//       <div className="container-fluid">
//         <NavLink className="navbar-brand" to="/">
//           App
//         </NavLink>

//         <div className="collapse navbar-collapse">
//           <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//             <li className="nav-item">
//               <NavLink
//                 to="/home"
//                 className={({ isActive }) =>
//                   `nav-link ${isActive ? 'active' : ''}`
//                 }
//               >
//                 Home
//               </NavLink>
//             </li>
//           </ul>

//           {/* Condizionale (equivalente di IfAuthenticatedDirective) */}
//           {currentUser ? (
//             <NavUser user={currentUser} onLogout={handleLogout} />
//           ) : (
//             <NavLink to="/login" className="btn btn-outline-primary">
//               Login
//             </NavLink>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import NavUser from '../nav-user/nav-user';
import './navbar.css';

export const Navbar: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <nav className="navbar mb-4">
        <div className="d-flex align-items-center gap-4">

        {/* Menu di Navigazione */}
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
              to="/home"
            >
              Home
            </NavLink>
          </li>

          {isAuthenticated && (
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
                to="/ricarica"
              >
                Ricarica
              </NavLink>
            </li>
          )}
        </ul>
        </div>

        {/* Icona di Login */}
        <div className="navbar-right">
        {isAuthenticated ? (
            <NavUser onLogout={() => setIsAuthenticated(false)} />
        ) : (
            <NavLink to="/login" className="btn-login-custom">
            {/* SVG Icona di Login / Entra */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
            >
                <path
                fillRule="evenodd"
                d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"
                />
                <path
                fillRule="evenodd"
                d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                />
            </svg>
            Login
            </NavLink>
        )}
        </div>
    </nav>
  );
};

export default Navbar;