const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');

// GET all albums
router.get('/', async (req, res) => {
  try {
    const albums = await Gallery.find();
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new album (optional, if you want to add albums via API)
router.post('/', async (req, res) => {
  try {
    const { title, description, photos } = req.body;
    const newAlbum = new Gallery({ title, description, photos });
    await newAlbum.save();
    res.status(201).json(newAlbum);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
