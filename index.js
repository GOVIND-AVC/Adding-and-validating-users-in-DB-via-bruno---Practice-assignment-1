const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./modeld/SCHEMA'); // Assuming this is the User model

const app = express();
const port = 3010;

// Middleware to serve static files and parse JSON request bodies
app.use(express.static('static'));
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/brunotest')
  .then(() => console.log("Database connected"))
  .catch((error) => console.log(error));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// Register route (use /register for registration)
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validation check for required fields
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, email, and password are required"
    });
  }

  // Check if user already exists by username or email
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "User with this email or username already exists"
    });
  }

  // Hash the password before saving
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword
  });

  // Save user to the database
  await newUser.save();

  res.status(201).json({
    success: true,
    message: "User registered successfully"
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
