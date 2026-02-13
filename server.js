const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { createConnection, initDatabase } = require('./database');

const multiplicationRoutes = require('./routes/multiplication.routes');

//const { createConnection } = require('./database'); --- IGNORE ---
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialiser la base de données au démarrage
initDatabase().catch(console.error);

// Utiliser les routes de multiplication
app.use('/multiplication', multiplicationRoutes);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
