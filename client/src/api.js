export const fetchFavorites = async (userId) => {
  try {
    const response = await fetch(`/getprofiledata/${userId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch favorites: ${errorText}`);
    }
    const result = await response.json();
    return result.data.favorites || [];
  } catch (err) {
    console.error('Error fetching favorites:', err);
    throw err;
  }
};


