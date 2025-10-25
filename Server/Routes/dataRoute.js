const express = require("express");
const router = express.Router();
const pool = require("../db");

// Add a new movie
router.post('/add', async (req, res) => {
  const { user_id, tmdb_id, title, poster_path, status } = req.body;

  try {
    // Check if movie already exists for this user
    const checkMovie = await pool.query(
      'SELECT * FROM movies WHERE user_id = $1 AND tmdb_id = $2',
      [user_id, tmdb_id]
    );

    if (checkMovie.rows.length > 0) {
      return res.status(400).json({ error: 'Movie already exists in your list!' });
    }

    // Insert new movie
    await pool.query(
      'INSERT INTO movies (user_id, tmdb_id, title, poster_path, status) VALUES ($1, $2, $3, $4, $5)',
      [user_id, tmdb_id, title, poster_path, status]
    );

    res.status(200).json({ message: 'Movie added successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update movie status
router.put("/update/:id", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE movies SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating movie" });
  }
});

// Get all movies for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM movies WHERE user_id=$1 ORDER BY id DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching movies" });
  }
});

// DELETE movie by id
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM movies WHERE id = $1', [id]);
    res.json({ message: 'Movie deleted successfully' });
  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
