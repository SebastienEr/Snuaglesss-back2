const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
  artist: String,
  title: String,
  album: String,
  startedAt: String, // Date et heure de début
  endAt: String, // Date et heure de fin
  duration: Number, // Durée du programme
  isLive: Boolean, // en live / pas en live
  cover: String, // url pochette album
  defaultCover: Boolean, // pochette affichée / pas affichée
  forcedTitle: Boolean, // ?
});

const Event = mongoose.model("events", eventSchema);

module.exports = Event;
