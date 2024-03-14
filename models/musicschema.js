//musicSchema.js
const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  title: String,
  cover: String
});

module.exports = musicSchema;
