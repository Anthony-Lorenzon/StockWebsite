import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header>
      <nav>
        {isAuthenticated && (
          <>
            <span>Welcome, {user.name}!</span>
            {currentPath !== '/profile' && <Link to="/profile">Profile</Link>}
            {currentPath !== '/datapage' && <Link to="/datapage">Data Page</Link>}
            <button onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>
          </>
        )}
        {!isAuthenticated && (
          <Link to="/">Sign In</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
