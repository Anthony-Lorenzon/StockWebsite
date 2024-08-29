import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return; //waiting until Auth0 has finished loading

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

/*         const data = await response.json();
        console.log('User added/updated:', data); */

        //redirect to DataPage after adding/updating the user
        navigate('/datapage');
      } catch (e) {
        console.error(e);
      }
    };

    if (isAuthenticated && user && !isRedirecting) {
      setIsRedirecting(true); //stops it from redirecting to multiple redirects
      addUser();
    }
  }, [isAuthenticated, user, isLoading, navigate, isRedirecting]);

  const handleLogin = async () => {
    try {
      await loginWithRedirect({
        appState: { returnTo: '/datapage' } //redirect to /datapage after login
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={handleLogin}>Log In</button>
      <a href="/datapage"><button>Go to Data Page as Guest</button></a> {/* navigation button */}
      <p>This currently only works for the NYSE and displays prices in USD.</p>
    </div>
  );
};

export default SignInPage;
