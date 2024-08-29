import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import SignInPage from './pages/SignInPage/SignInPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import DataPage from './pages/DataPage/DataPage';

function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    if (!isLoading) {
      if (isAuthenticated) {
        if (location.state?.returnTo && location.pathname !== location.state.returnTo) {
          navigate(location.state.returnTo, { replace: true });
        } else if (location.pathname === '/') {
          navigate('/datapage', { replace: true });
        }
      } else if (location.pathname === '/profile' || location.pathname === '/') {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading]); 

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<SignInPage />} />
      <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <SignInPage />} />
      <Route path="/datapage" element={<DataPage />} />
    </Routes>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
