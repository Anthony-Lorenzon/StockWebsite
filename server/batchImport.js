const fs = require('node:fs');
const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;


const client = new MongoClient(MONGO_URI);

// Added this part just to give us one user, so we can access the cart
const defaultUser = {
    auth0Id: 0,//"auth0|unique-auth0-id",  // Auth0 unique identifier
    name: "Testy",
    email: "testy@tester.com",
    favorites: [
        { id: "AAPL" },
        { id: "TSLA" },
        { id: "TD.TO" }
    ]
}
    
const batchImport = async () => {
    try{
        await client.connect()
        console.log("connected")
        
        const db = client.db('User-Stock');

        await db.collection("users").insertOne(defaultUser)
    } catch(error){
        console.error(error)
    }finally{
        console.log("disconnected");
        client.close();
    }
}

batchImport();

