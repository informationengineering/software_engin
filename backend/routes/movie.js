const express = require('express');
const router = express.Router();
const db = require('../db');

// [取得所有電影]
// 前端呼叫：GET http://localhost:3001/api/movie/all
router.get('/all', async (req, res) => {
    try {
        const [movies] = await db.query('SELECT * FROM movie');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [取得單一電影詳細資訊]
// 前端呼叫：GET http://localhost:3001/api/movie/detail/1 (1是電影ID)
router.get('/detail/:id', async (req, res) => {
    try {
        const movieID = req.params.id;
        const [movie] = await db.query('SELECT * FROM movie WHERE movieID = ?', [movieID]);
        if (movie.length > 0) {
            res.json(movie[0]);
        } else {
            res.status(404).json({ message: "找不到電影" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [取得影城列表]
// 前端呼叫：GET http://localhost:3001/api/movie/cinemas
router.get('/cinemas', async (req, res) => {
    try {
        const [cinemas] = await db.query('SELECT * FROM cinema');
        res.json(cinemas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;