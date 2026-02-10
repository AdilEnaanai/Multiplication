const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { createConnection, initDatabase } = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialiser la base de données au démarrage
initDatabase().catch(console.error);

// Route pour créer ou récupérer un utilisateur
app.post('/api/users', async (req, res) => {
  try {
    const { name } = req.body;
    const connection = await createConnection();
    
    const [result] = await connection.query(
      'INSERT INTO users (name) VALUES (?)',
      [name]
    );
    
    const userId = result.insertId;
    
    // Créer les entrées de progression pour toutes les opérations
    const [operations] = await connection.query('SELECT id FROM operations');
    
    for (const op of operations) {
      await connection.query(
        `INSERT IGNORE INTO user_progress (user_id, operation_id, validation_level) 
         VALUES (?, ?, 0)`,
        [userId, op.id]
      );
    }
    
    await connection.end();
    res.json({ userId, name });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// Route pour récupérer une question aléatoire
app.get('/api/question/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const connection = await createConnection();
    
    // Récupérer toutes les opérations non validées complètement
    const [questions] = await connection.query(`
      SELECT o.id, o.number1, o.number2, up.validation_level
      FROM operations o
      JOIN user_progress up ON o.id = up.operation_id
      WHERE up.user_id = ? AND up.is_validated = FALSE
      ORDER BY RAND()
      LIMIT 1
    `, [userId]);
    
    if (questions.length === 0) {
      await connection.end();
      return res.json({ completed: true });
    }
    
    const question = questions[0];
    const correctAnswer = question.number1 * question.number2;
    
    // Générer 3 réponses incorrectes
    const wrongAnswers = new Set();
    while (wrongAnswers.size < 3) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrongAnswer = correctAnswer + offset;
      if (wrongAnswer !== correctAnswer && wrongAnswer >= 0) {
        wrongAnswers.add(wrongAnswer);
      }
    }
    
    // Mélanger les réponses
    const answers = [correctAnswer, ...Array.from(wrongAnswers)]
      .sort(() => Math.random() - 0.5);
    
    await connection.end();
    res.json({
      operationId: question.id,
      number1: question.number1,
      number2: question.number2,
      answers,
      correctAnswer,
      validationLevel: question.validation_level
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la question' });
  }
});

// Route pour vérifier une réponse
app.post('/api/answer', async (req, res) => {
  try {
    const { userId, operationId, answer, correctAnswer } = req.body;
    const connection = await createConnection();
    
    const isCorrect = answer === correctAnswer;
    
    if (isCorrect) {
      // Incrémenter le niveau de validation
      const [current] = await connection.query(
        'SELECT validation_level FROM user_progress WHERE user_id = ? AND operation_id = ?',
        [userId, operationId]
      );
      
      const newLevel = current[0].validation_level + 1;
      const isValidated = newLevel >= 5;
      
      await connection.query(
        `UPDATE user_progress 
         SET validation_level = ?, is_validated = ?
         WHERE user_id = ? AND operation_id = ?`,
        [newLevel, isValidated, userId, operationId]
      );
    } else {
      // Réinitialiser à 0 si la réponse est incorrecte
      await connection.query(
        `UPDATE user_progress 
         SET validation_level = 0
         WHERE user_id = ? AND operation_id = ?`,
        [userId, operationId]
      );
    }
    
    await connection.end();
    res.json({ isCorrect });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification de la réponse' });
  }
});

// Route pour récupérer la progression globale
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const connection = await createConnection();
    
    const [total] = await connection.query(
      'SELECT COUNT(*) as total FROM operations'
    );
    
    const [validated] = await connection.query(
      'SELECT COUNT(*) as validated FROM user_progress WHERE user_id = ? AND is_validated = TRUE',
      [userId]
    );
    
    const totalOperations = total[0].total;
    const validatedOperations = validated[0].validated;
    const percentage = Math.round((validatedOperations / totalOperations) * 100);
    
    await connection.end();
    res.json({
      total: totalOperations,
      validated: validatedOperations,
      percentage
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la progression' });
  }
});

// Route pour récupérer les détails de progression
app.get('/api/progress-details/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const connection = await createConnection();
    
    const [progress] = await connection.query(`
      SELECT o.number1, o.number2, up.validation_level, up.is_validated
      FROM operations o
      JOIN user_progress up ON o.id = up.operation_id
      WHERE up.user_id = ?
      ORDER BY o.number1, o.number2
    `, [userId]);
    
    await connection.end();
    res.json(progress);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails' });
  }
});

// Servir le fichier HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
