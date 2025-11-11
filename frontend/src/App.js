import React, { useState } from 'react';

function App() {
  const [mood, setMood] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  async function handleLogin() {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setIsLoggedIn(true);
      alert('Logged in successfully');
    } else {
      alert('Login failed');
    }
  }

  async function handleMoodSubmit() {
    if (!mood) {
      alert('Please select a mood');
      return;
    }

    const res = await fetch(`http://localhost:5000/api/recipes?mood=${mood}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRecipes(data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Mood-Based Recipe Recommender</h1>

      {!isLoggedIn && (
        <div>
          <h2>Login</h2>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {isLoggedIn && (
        <div>
          <h2>Select your mood</h2>
          <select value={mood} onChange={e => setMood(e.target.value)}>
            <option value="">--Choose mood--</option>
            <option value="happy">Happy</option>
            <option value="calm">Calm</option>
            <option value="joyful">Joyful</option>
            <option value="relaxed">Relaxed</option>
          </select>
          <button onClick={handleMoodSubmit}>Get Recipes</button>

          <h3>Recommended Recipes</h3>
          <ul>
            {recipes.map(recipe => (
              <li key={recipe.id}>{recipe.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
