const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
  artist: String,
  title: String,
  album: String,
  started_at: String, // Date et heure de début
  end_at: String, // Date et heure de fin
  duration: Number, // Durée du programme
  is_live: Boolean, // en live / pas en live
  cover: String, // url pochette album
  default_cover: Boolean, // pochette affichée / pas affichée
  forced_title: Boolean, // ?
});

const Event = mongoose.model("events", eventSchema);

module.exports = Event;
