const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  
  isAdmin: {
    type: Boolean,
    default: false 
  },
  
  token: String,
  password: String,
  
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  profilePic: String,
  
  IsReported: {
    type: Boolean,
    default: false,
  },
  
  likes: Boolean,
  favoriteSong: String,

  IsVerified:{
    type: Boolean,
    default: false,
  }

});

const User = mongoose.model('users', userSchema);

module.exports = User;
