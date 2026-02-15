const path = require('path');
const { createConnection } = require('../database');
const express = require('express');
const router = express.Router();

// Servir le fichier HTML
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


module.exports = router;