import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import getStockData from './getStockData'; 
import { fetchFavorites } from '../../api';
import Header from '../../Header';

const DataPage = () => {
  const { user, isAuthenticated } = useAuth0();
  const [inputValue, setInputValue] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [stockError, setStockError] = useState(null); 
  const [isFavorite, setIsFavorite] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated && user?.sub) {
        try {
          setFavoritesLoading(true);
          const favorites = await fetchFavorites(user.sub);
          setFavorites(favorites);
        } catch (err) {
          setError('Could not load favorites.');
        } finally {
          setFavoritesLoading(false);
        }
      }
    };

    loadFavorites();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (stockData && favorites.length > 0) {
      const isFav = favorites.some(
        (favorite) => favorite.id === stockData.symbol.toUpperCase()
      );
      setIsFavorite(isFav);
    }
  }, [stockData, favorites]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputSubmit = async (event) => {
    event.preventDefault();
    const value = inputValue.trim();
    if (value === '') return;

    setError(null);
    setStockError(null); //clear old stock errors

    try {
      const data = await getStockData(value);
      setStockData(data);
      setStockError(null); //clear old stock errors

      const isFav = favorites.some(
        (favorite) => favorite.id === data.symbol.toUpperCase()
      );
      setIsFavorite(isFav);
    } catch (error) {
      setStockData(null);
      setStockError('Failed to fetch stock data. Stock may not exist.');
    }
  };

  const handleAddOrRemoveFavorite = async () => {
    if (isAuthenticated && stockData) {
      setIsButtonDisabled(true);
      try {
        const response = await fetch(
          isFavorite ? '/removeFromFavorites' : '/addToFavorites',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              auth0Id: user.sub,
              favoriteId: stockData.symbol,
              favoriteName: stockData.companyName,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            isFavorite ? 'Failed to remove from favorites' : 'Failed to add to favorites'
          );
        }

        const updatedFavorites = await fetchFavorites(user.sub);
        setFavorites(updatedFavorites);
        setIsFavorite(!isFavorite);
      } catch (err) {
        setError(
          isFavorite ? 'Failed to remove from favorites.' : 'Failed to add to favorites.'
        );
      } finally {
        setIsButtonDisabled(false);
      }
    } else {
      setError('You must be signed in to modify favorites.');
    }
  };

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
          throw new Error('Failed to remove from favorites');
        }

        const updatedFavorites = await fetchFavorites(user.sub);
        setFavorites(updatedFavorites);
      } catch (err) {
        setError('Failed to remove from favorites.');
      } finally {
        setIsButtonDisabled(false);
      }
    } else {
      setError('You must be signed in to modify favorites.');
    }
  };

  return (
    <div>
      <Header />
      <h1>Data Page</h1>
      {isAuthenticated && user ? (
        <>
          <p>Welcome, {user.name}!</p>
          <p>Email: {user.email}</p>
        </>
      ) : (
        <p>You are viewing this page as a guest.</p>
      )}

      <div>
        <h2>Your Favorites:</h2>
        {favoritesLoading ? (
          <p>Loading favorites...</p>
        ) : error ? (
          <p>{error}</p>
        ) : favorites.length > 0 ? (
          <ul>
            {favorites.map((favorite, index) => (
              <li key={index}>
                {favorite.id} - {favorite.stockName}
                <button
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  disabled={isButtonDisabled}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no favorites.</p>
        )}
      </div>

      <form onSubmit={handleInputSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter stock symbol"
        />
        <button type="submit" disabled={isButtonDisabled}>Submit</button>
      </form>

      {stockData && (
        <div>
          <h2>{stockData.symbol}</h2>
          <h3>{stockData.companyName}</h3>
          <p>Price: ${stockData.currentPrice}</p>
          <button
            onClick={handleAddOrRemoveFavorite}
            disabled={isButtonDisabled}
          >
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        </div>
      )}

      {stockError && (
        <div>
          <p>{stockError}</p>
        </div>
      )}
    </div>
  );
};

export default DataPage;
