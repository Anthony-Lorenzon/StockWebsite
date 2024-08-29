const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;

const DB = "User-Stock";
const users = "users";

const getProfileData = async (req, res) => {
    const auth0UserID = req.params.auth0id;
    const client = new MongoClient(MONGO_URI);
    //console.log(auth0UserID)

    try {
        await client.connect();
        const db = client.db(DB);
        const foundUser = await db.collection(users).findOne({ auth0Id: auth0UserID });

        if (!foundUser) {
            res.status(404).json({ status: 404, message: 'User was not found.' });
        } else {
            res.status(200).json({ status: 200, data: foundUser });
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    } finally {
        await client.close();
    }
};

const addUser = async (req, res) => {
    const { auth0Id, name, email } = req.body;

    if (!auth0Id || !name || !email) {
        return res.status(400).json({ status: 400, message: 'Missing required fields' });
    }

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB);
        const usersCollection = db.collection(users);

        const existingUser = await usersCollection.findOne({ auth0Id });

        if (existingUser) {
            return res.status(200).json({ status: 200, message: 'User with this Auth0 ID already exists' });
        }

        const result = await usersCollection.insertOne({
            auth0Id, 
            name, 
            email, 
            favorites: [] 
        });

        res.status(201).json({ status: 201, message: 'User created', data: result });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    } finally {
        await client.close();
    }
};

const addToFavorites = async (req, res) => {
    const { auth0Id, favoriteId, favoriteName } = req.body; // favoriteItem should be an object like { id: "aapl", stockName: "Apple Inc." }
    //console.log(favoriteName)

    if (!auth0Id || !favoriteId || !favoriteName) {
        return res.status(400).json({ status: 400, message: 'Missing required fields' });
    }

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB);
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ auth0Id });

        if (!existingUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        //capitalize the id
        const capitalizedId = favoriteId.toUpperCase();

        //check if the item with the same id already exists in the user's favorites
        const isFavoriteExists = existingUser.favorites.some(favorite => favorite.id === capitalizedId);

        if (isFavoriteExists) {
            return res.status(409).json({ status: 409, message: 'Item is already in favorites' });
        }

        //prepare the favorite item with capitalized id and stockName
        const newFavorite = {
            id: capitalizedId,
            stockName: favoriteName
        };

        //add the item to the user's favorites
        await usersCollection.updateOne(
            { auth0Id },
            { $push: { favorites: newFavorite } }
        );

        res.status(200).json({ status: 200, message: 'Item added to favorites' });
    } catch (err) {
        console.error('Error adding to favorites:', err);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    } finally {
        await client.close();
    }
};

const removeFromFavorites = async (req, res) => {
    const { auth0Id, favoriteId } = req.body;
    console.log(favoriteId)
    if (!auth0Id || !favoriteId) {
        return res.status(400).json({ status: 400, message: 'Missing required fields' });
    }

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB);
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ auth0Id });

        if (!existingUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        //remove the favorite item with the matching id
        const result = await usersCollection.updateOne(
            { auth0Id },
            { $pull: { favorites: { id: favoriteId.toUpperCase() } } } // Ensure the ID is capitalized
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ status: 404, message: 'Favorite item not found' });
        }

        res.status(200).json({ status: 200, message: 'Item removed from favorites' });
    } catch (err) {
        console.error('Error removing from favorites:', err);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    } finally {
        await client.close();
    }
};

module.exports = {
    getProfileData,
    addUser,
    addToFavorites,
    removeFromFavorites
};




