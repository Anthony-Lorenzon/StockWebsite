import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import getStockData from "./getStockData";
import { fetchFavorites } from "../../api";
import Header from "../../Header";
import styled from "styled-components";

const DataPage = () => {
  const { user, isAuthenticated } = useAuth0();
  const [inputValue, setInputValue] = useState("");
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
          setError("Could not load favorites.");
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

  const handleInputSubmit = async (event, searchValue = null) => {
    if (event) event.preventDefault();
    const value = searchValue || inputValue.trim();
    if (value === "") return;

    setError(null);
    setStockError(null); 

    try {
      const data = await getStockData(value);
      setStockData(data);
      setStockError(null); 

      const isFav = favorites.some(
        (favorite) => favorite.id === data.symbol.toUpperCase()
      );
      setIsFavorite(isFav);
    } catch (error) {
      setStockData(null);
      setStockError("Failed to fetch stock data. Stock may not exist.");
    }
  };

  const handleAddOrRemoveFavorite = async () => {
    if (isAuthenticated && stockData) {
      setIsButtonDisabled(true);
      try {
        const response = await fetch(
          isFavorite ? "/removeFromFavorites" : "/addToFavorites",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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
            isFavorite
              ? "Failed to remove from favorites"
              : "Failed to add to favorites"
          );
        }

        const updatedFavorites = await fetchFavorites(user.sub);
        setFavorites(updatedFavorites);
        setIsFavorite(!isFavorite);
      } catch (err) {
        setError(
          isFavorite
            ? "Failed to remove from favorites."
            : "Failed to add to favorites."
        );
      } finally {
        setIsButtonDisabled(false);
      }
    } else {
      setError("You must be signed in to modify favorites.");
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    if (isAuthenticated) {
      setIsButtonDisabled(true);
      try {
        const response = await fetch("/removeFromFavorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth0Id: user.sub,
            favoriteId: favoriteId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to remove from favorites");
        }

        const updatedFavorites = await fetchFavorites(user.sub);
        setFavorites(updatedFavorites);
      } catch (err) {
        setError("Failed to remove from favorites.");
      } finally {
        setIsButtonDisabled(false);
      }
    } else {
      setError("You must be signed in to modify favorites.");
    }
  };

  const handleFavoriteClick = (favoriteId) => {
    handleInputSubmit(null, favoriteId);
  };

  return (
    <Container>
      <Header />
      <Content>
        <Heading>Data Page</Heading>
        {isAuthenticated && user ? (
          <WelcomeText>
            <p>Welcome, {user.name}!</p>
            <p>Email: {user.email}</p>
          </WelcomeText>
        ) : (
          <GuestText>You are viewing this page as a guest.</GuestText>
        )}

        <FavoritesSection>
          <h2>Your Favorites:</h2>
          {favoritesLoading ? (
            <LoadingText>Loading favorites...</LoadingText>
          ) : error ? (
            <ErrorText>{error}</ErrorText>
          ) : favorites.length > 0 ? (
            <FavoritesList>
              {favorites.map((favorite) => (
                <FavoriteItem
                  key={favorite.id}
                  onClick={() => handleFavoriteClick(favorite.id)}
                >
                  {favorite.id} - {favorite.stockName}
                  <RemoveButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.id);
                    }}
                    disabled={isButtonDisabled}
                  >
                    Remove
                  </RemoveButton>
                </FavoriteItem>
              ))}
            </FavoritesList>
          ) : (
            <NoFavoritesText>You have no favorites.</NoFavoritesText>
          )}
        </FavoritesSection>

        <Form onSubmit={handleInputSubmit}>
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter stock symbol"
          />
          <SubmitButton type="submit" disabled={isButtonDisabled}>
            Submit
          </SubmitButton>
        </Form>

        {stockData && (
          <StockInfo>
            <h2>{stockData.symbol}</h2>
            <h3>{stockData.companyName}</h3>
            <p>Price: ${stockData.currentPrice}</p>
            <FavoriteButton
              onClick={handleAddOrRemoveFavorite}
              disabled={isButtonDisabled}
            >
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </FavoriteButton>
          </StockInfo>
        )}

        {stockError && (
          <ErrorContainer>
            <ErrorText>{stockError}</ErrorText>
          </ErrorContainer>
        )}
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;
  min-height: 100vh;
`;

const Content = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Heading = styled.h1`
  margin-bottom: 20px;
  color: #333;
  text-align: center;
`;

const WelcomeText = styled.div`
  margin-bottom: 20px;
  text-align: center;
  p {
    margin: 5px 0;
  }
`;

const GuestText = styled.p`
  font-size: 16px;
  color: #666;
  text-align: center;
`;

const FavoritesSection = styled.div`
  margin-bottom: 30px;
`;

const LoadingText = styled.p`
  color: #007bff;
  text-align: center;
`;

const ErrorText = styled.p`
  color: #dc3545;
  text-align: center;
`;

const NoFavoritesText = styled.p`
  font-size: 16px;
  color: #666;
  text-align: center;
`;

const FavoritesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
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

const Form = styled.form`
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  margin-right: 10px;
  font-size: 16px;
  width: 200px;
`;

const SubmitButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const StockInfo = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const FavoriteButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #218838;
  }
`;

const ErrorContainer = styled.div`
  margin-top: 20px;
  text-align: center;
`;

export default DataPage;
