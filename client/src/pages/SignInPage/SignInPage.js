import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SignInPage = () => {
  const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return; 

    const addUser = async () => {
      try {
        const response = await fetch('/addUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth0Id: user.sub,
            name: user.name,
            email: user.email,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create or update user.');
        }

        
        navigate('/datapage');
      } catch (e) {
        console.error(e);
      }
    };

    if (isAuthenticated && user && !isRedirecting) {
      setIsRedirecting(true); 
      addUser();
    }
  }, [isAuthenticated, user, isLoading, navigate, isRedirecting]);

  const handleLogin = async () => {
    try {
      await loginWithRedirect({
        appState: { returnTo: '/datapage' } 
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container>
      <Heading>Sign In</Heading>
      <Button onClick={handleLogin}>Log In</Button>
      <GuestLink href="/datapage">
        <Button>Go to Data Page as Guest</Button>
      </GuestLink>
      <InfoText>This currently only works for the NYSE and displays prices in USD.</InfoText>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff; 
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Heading = styled.h1`
  margin-bottom: 20px;
  color: #333; 
`;

const Button = styled.button`
  background-color: #007bff; 
  color: white;
  margin: 10px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #0056b3; 
  }
`;

const GuestLink = styled.a`
  text-decoration: none;
`;

const InfoText = styled.p`
  margin-top: 20px;
  font-size: 14px;
  color: #666; 
`;

export default SignInPage;
