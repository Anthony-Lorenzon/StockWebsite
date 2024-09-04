
const getStockData = async (symbol) => {

    const apiKey = process.env.REACT_APP_APIKEY;
     
    try {
        const url = `https://financialmodelingprep.com/api/v3/company/profile/${symbol}?apikey=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.profile) {
            return {
                symbol: symbol.toUpperCase(), 
                companyName: data.profile.companyName,
                currentPrice: data.profile.price
            };
        } else {
            throw new Error('Invalid data structure');
        }
    } catch (error) {
        console.error('Failed to fetch stock data:', error);
        throw error;
    }
};

module.exports = getStockData;
