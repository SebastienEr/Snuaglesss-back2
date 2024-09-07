const mongoose = require("mongoose");
require("dotenv").config();

const dbURL = process.env.CONNECTION_STRING;

mongoose
  .connect(dbURL)
  .then(() => {
    console.log("Connexion à la base de données réussie");
  })
  .catch((err) => {
    console.error("Erreur de connexion à la base de données :", err);
  });

module.exports = mongoose.connection;