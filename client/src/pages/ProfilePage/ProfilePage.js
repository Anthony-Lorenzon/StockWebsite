import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchFavorites } from '../../api'; //ensure removeFavorite function is implemented in your the api file
import Header from '../../Header';

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

        //update favorites after a it works... finally
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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <h1>Profile Page</h1>
      <p>Welcome, {user.name}!</p>
      <p>Email: {user.email}</p>
      <p>sub thing: {user.sub}</p>

      {loading ? (
        <p>Loading favorites...</p>
      ) : error ? (
        <p>{error}</p>
      ) : favorites.length === 0 ? (
        <p>You have no favorites.</p>
      ) : (
        <ul>
          {favorites.map((favorite, index) => (
            <li key={index}>
              <strong>{favorite.stockName}</strong> ({favorite.id})
              <button
                onClick={() => handleRemoveFavorite(favorite.id)}
                disabled={isButtonDisabled}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfilePage;
