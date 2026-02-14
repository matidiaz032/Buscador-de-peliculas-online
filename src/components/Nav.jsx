import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserListsContext } from '../context/UserListsContext';

const NavLink = ({ to, children, pathname, onClick }) => (
  <Link
    to={to}
    className={`app-nav-link ${pathname === to ? 'is-active' : ''}`}
    onClick={onClick}
  >
    {children}
  </Link>
);

export const Nav = () => {
  const { pathname } = useLocation();
  const { favorites, watchlist, watched } = useUserListsContext();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="app-nav">
      <div className="app-nav-inner">
        <button
          type="button"
          className="app-nav-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`app-nav-links ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/" pathname={pathname} onClick={closeMenu}>
            Buscar
          </NavLink>
          <NavLink to="/favorites" pathname={pathname} onClick={closeMenu}>
            Favoritos {favorites.length > 0 && `(${favorites.length})`}
          </NavLink>
          <NavLink to="/watchlist" pathname={pathname} onClick={closeMenu}>
            Ver después {watchlist.length > 0 && `(${watchlist.length})`}
          </NavLink>
          <NavLink to="/watched" pathname={pathname} onClick={closeMenu}>
            Vistas {watched.length > 0 && `(${watched.length})`}
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
