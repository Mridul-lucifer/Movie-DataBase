const express = require("express");
const router = express.Router();
const pool = require("../db");

// Add a new movie
router.post("/add", async (req, res) => {
  const { user_id, tmdb_id, title, poster_path, status } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO movies (user_id, tmdb_id, title, poster_path, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, tmdb_id, title, poster_path, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding movie" });
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
