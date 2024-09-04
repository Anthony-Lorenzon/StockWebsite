// ProfilePage.js
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchFavorites } from '../../api'; 
import Header from '../../Header';
import styled from 'styled-components';

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth0();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const getFavorites = async () => {
      if (isAuthenticated && user && user.sub) {
        try {
          const favorites = await fetchFavorites(user.sub);
          setFavorites(favorites);
        } catch (err) {
          setError('Could not load favorites.');
        } finally {
          setLoading(false);
        }
      }
    };

    getFavorites();
  }, [isAuthenticated, user]);

  const handleRemoveFavorite = async (favoriteId) => {
    if (isAuthenticated) {
      setIsButtonDisabled(true);
      try {
        const response = await fetch('/removeFromFavorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth0Id: user.sub,
            favoriteId: favoriteId,
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to remove from favorites: ${errorMessage}`);
        }

        
        const updatedFavorites = await fetchFavorites(user.sub);
        setFavorites(updatedFavorites);
      } catch (err) {
        console.error('Error removing favorite:', err);
        setError(`Failed to remove from favorites: ${err.message}`);
      } finally {
        setIsButtonDisabled(false);
      }
    } else {
      setError('You must be signed in to modify favorites.');
    }
  };

  if (!isAuthenticated) {
    return <LoadingText>Loading...</LoadingText>;
  }

  return (
    <Container>
      <Header />
      <Heading>Profile Page</Heading>
      <UserInfo>
        <p>Welcome, {user.name}!</p>
        <p>Email: {user.email}</p>
      </UserInfo>
      
      {loading ? (
        <LoadingText>Loading favorites...</LoadingText>
      ) : error ? (
        <ErrorText>{error}</ErrorText>
      ) : favorites.length === 0 ? (
        <NoFavoritesText>You have no favorites.</NoFavoritesText>
      ) : (
        <FavoritesList>
          {favorites.map((favorite) => (
            <FavoriteItem key={favorite.id}>
              <strong>{favorite.stockName}</strong> ({favorite.id})
              <RemoveButton
                onClick={() => handleRemoveFavorite(favorite.id)}
                disabled={isButtonDisabled}
              >
                Remove
              </RemoveButton>
            </FavoriteItem>
          ))}
        </FavoritesList>
      )}
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

const UserInfo = styled.div`
  margin-bottom: 20px;
  p {
    margin: 5px 0;
  }
`;

const LoadingText = styled.p`
  color: #007bff; 
`;

const ErrorText = styled.p`
  color: #dc3545; 
`;

const NoFavoritesText = styled.p`
  font-size: 16px;
  color: #666; 
`;

const FavoritesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 600px; 
`;

const FavoriteItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9; 
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RemoveButton = styled.button`
  background-color: #dc3545; 
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #c82333; 
  }
`;

export default ProfilePage;
