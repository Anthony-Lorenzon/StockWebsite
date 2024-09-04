import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import styled from 'styled-components';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <HeaderContainer>
      <Nav>
        {isAuthenticated && (
          <>
            {/* <WelcomeText>Welcome, {user.name}!</WelcomeText> */}
            {currentPath !== '/profile' && <StyledLink to="/profile">Profile</StyledLink>}
            {currentPath !== '/datapage' && <StyledLink to="/datapage">Data Page</StyledLink>}
            <LogoutButton onClick={() => logout({ returnTo: window.location.origin })}>
              Log Out
            </LogoutButton>
          </>
        )}
        {!isAuthenticated && (
          <StyledLink to="/">Sign In</StyledLink>
        )}
      </Nav>
    </HeaderContainer>
  );
};


const HeaderContainer = styled.header`
  background-color: #007bff; 
  padding: 10px 20px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WelcomeText = styled.span`
  font-size: 16px;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin: 0 15px; 
  font-size: 18px; 
  font-weight: bold; 
  position: relative;
  transition: color 0.3s, border-bottom 0.3s;

  &:hover {
    color: #e2e6ea; 
    border-bottom: 2px solid #e2e6ea; 
  }
`;

const LogoutButton = styled.button`
  background-color: #dc3545; 
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 16px; 
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c82333; 
  }
`;

export default Header;
