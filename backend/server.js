const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Dummy users - in a real app, use a database
const users = [];

// Secret key for JWT
const JWT_SECRET = 'your-secret-key';

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User registered' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Placeholder recipe data
const recipes = [
  { id: 1, name: 'Happy Pancakes', mood_tags: ['happy', 'joyful'], ingredients: ['flour', 'milk', 'eggs'], instructions: 'Mix and cook.' },
  { id: 2, name: 'Calm Salad', mood_tags: ['calm', 'relaxed'], ingredients: ['lettuce', 'tomato', 'cucumber'], instructions: 'Toss together.' }
];

// Get recipes by mood
app.get('/api/recipes', authenticateToken, (req, res) => {
  const { mood } = req.query;
  if (!mood) return res.status(400).json({ message: 'Mood query parameter required' });
  const matched = recipes.filter(r => r.mood_tags.includes(mood.toLowerCase()));
  res.json(matched);
});

// Favorites (simple in-memory)
const favorites = {};

// Add favorite
app.post('/api/favorites', authenticateToken, (req, res) => {
  const username = req.user.username;
  const { recipeId } = req.body;
  if (!favorites[username]) favorites[username] = new Set();
  favorites[username].add(recipeId);
  res.json({ message: 'Added to favorites' });
});

// Get favorites
app.get('/api/favorites', authenticateToken, (req, res) => {
  const username = req.user.username;
  const favs = favorites[username] ? Array.from(favorites[username]) : [];
  res.json(favs);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
