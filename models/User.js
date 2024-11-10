// models/User.js
import mongoose from 'mongoose';

// Define the User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    // trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    // unique: true,
    lowercase: true,

  },
  bio: {
    type: String,
    // default: ''
  },
  profilePic: {
    type: String, // URL or file path to the profile picture
    // default: ''
  },
  birthdate: {
    type: Date,
    // required: false,  // Make it optional if necessary

  },

  role: {
    type: String,
    enum: ['student', 'celebrity', 'influencer', 'other'], // Restrict to specific values
    // default: 'student'
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Reference to User collection
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // References to followers
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

// Create the User model using the schema
const User = mongoose.model('User', userSchema);

export default User;
