// server.js
// ============================
// Tripwise backend (Node + Express + MySQL)
// ============================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// ============================
// Create Express app
// ============================
const app = express();

// Middleware
app.use(cors());          // allow requests from your frontend
app.use(express.json());  // parse JSON bodies

// ============================
// MySQL connection
// ============================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0Po98iu76y*',  // <-- change if your MySQL password is different
  database: 'tripwise'
});

db.connect(err => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
  } else {
    console.log('✅ Connected to MySQL (tripwise)');
  }
});

// ============================
// AUTH ROUTES
// ============================

// SIGNUP: create new user
// POST /api/signup  { name, email, password }
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Missing name, email, or password' });
  }

  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);

      // Duplicate email (unique index on email)
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }

      return res.status(500).json({ error: 'Could not create user' });
    }

    // Return user data as frontend expects
    res.json({
      id: result.insertId,
      name,
      email
    });
  });
});

// LOGIN: check email + password
// POST /api/login  { email, password }
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Missing email or password' });
  }

  const sql = 'SELECT id, name, email, password FROM users WHERE email = ?';

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = results[0];

    // Simple password check (no hashing here)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Send user data without the password
    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  });
});

// ============================
// TRIP ROUTES
// ============================

// CREATE trip with itinerary
// POST /api/trips
// body: { user_id, trip_name, country, start_date, end_date, days_count, itinerary }
app.post('/api/trips', (req, res) => {
  // 1. Read data from HTTP request body (JSON)
  const {
    user_id,
    trip_name,
    country,
    start_date,
    end_date,
    days_count,
    itinerary
  } = req.body;

  // 2. Validate required fields
  if (!user_id || !country || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required trip fields' });
  }

  // 3. Prepare data for storage
  // Make sure we have a JSON string to store
  const itineraryJson = JSON.stringify(itinerary || []);

  const sql = `
    INSERT INTO trips
      (user_id, trip_name, country, start_date, end_date, days_count, itinerary_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // 4. Execute SQL command asynchronously
  db.query(
    sql,
    [user_id, trip_name, country, start_date, end_date, days_count || null, itineraryJson],
    (err, result) => {
      if (err) {
        console.error('Error inserting trip:', err);
        return res.status(500).json({ error: 'Failed to save trip' });
      }

      // 5. Send JSON response back to the client
      res.json({
        id: result.insertId,
        user_id,
        trip_name,
        country,
        start_date,
        end_date,
        days_count: days_count || null,
        itinerary: itinerary || []
      });
    }
  );
});

// GET all trips for one user (summary, no itinerary parsing here)
// GET /api/trips/:userId
app.get('/api/trips/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      id,
      trip_name,
      country,
      start_date,
      end_date,
      days_count,
      created_at
    FROM trips
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching trips:', err);
      return res.status(500).json({ error: 'Failed to load trips' });
    }

    res.json(results);
  });
});

// Get a single trip *with* itinerary
// GET /api/trip/:id
app.get('/api/trip/:id', (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT
      id,
      user_id,
      trip_name,
      country,
      start_date,
      end_date,
      days_count,
      itinerary_json
    FROM trips
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching trip:', err);
      return res.status(500).json({ error: 'Failed to load trip' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const row = results[0];

    let itinerary = [];
    if (row.itinerary_json) {
      if (typeof row.itinerary_json === 'string') {
        // The column is TEXT / VARCHAR, so we need to parse it
        try {
          itinerary = JSON.parse(row.itinerary_json);
        } catch (e) {
          console.error('Error parsing itinerary_json:', e);
          itinerary = [];
        }
      } else {
        // The column is JSON and mysql2 already parsed it
        itinerary = row.itinerary_json;
      }
    }

    res.json({
      id: row.id,
      user_id: row.user_id,
      trip_name: row.trip_name,
      country: row.country,
      start_date: row.start_date,
      end_date: row.end_date,
      days_count: row.days_count,
      itinerary: itinerary
    });
  });
});

// ============================
// Test route
// ============================
app.get('/', (req, res) => {
  res.send('Tripwise backend is running.');
});

// ============================
// Start server
// ============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Optional export if you ever need it in tests or other files
module.exports = app;
