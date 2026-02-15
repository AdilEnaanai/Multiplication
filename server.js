const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
<<<<<<< HEAD

const { initDatabase } = require('./database');

const multiplicationRoutes = require('./multiplication_app/multiplication.routes');

//const { createConnection } = require('./database'); --- IGNORE ---
=======
const path = require('path');
const { createConnection, initDatabase } = require('./database');

>>>>>>> parent of f7e190a (test)
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
//app.use(express.static('public'));

// Initialiser la base de données au démarrage
initDatabase().catch(console.error);

// ✅ Servir les fichiers statiques (HTML/CSS/JS) sous /multiplication
app.use('/multiplication', express.static(path.join(__dirname, 'multiplication_app')));

// ✅ Page d’accueil : /multiplication
app.get('/multiplication', (req, res) => {
  res.sendFile(path.join(__dirname, 'multiplication_app', 'index.html'));
});
// Utiliser les routes de multiplication
app.use('/multiplication', multiplicationRoutes);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
