// Configuration de la base de données MySQL
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'mysql',
  user: 'root',
  password: '1111', // À modifier selon votre configuration
  database: 'multiplication_db'
};

// Fonction pour créer la connexion
async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    throw error;
  }
}

// Fonction pour initialiser la base de données
async function initDatabase() {
  try {
    // Connexion sans base de données spécifique
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log('Connexion à la base de données réussie');

    // Créer la base de données si elle n'existe pas
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Base de données '${dbConfig.database}' créée ou déjà existante`);
    await connection.query(`USE ${dbConfig.database}`);

    // Créer la table des utilisateurs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Créer la table des opérations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS operations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        number1 INT NOT NULL,
        number2 INT NOT NULL,
        UNIQUE KEY unique_operation (number1, number2)
      )
    `);

    // Créer la table de progression
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        operation_id INT NOT NULL,
        validation_level INT DEFAULT 0,
        is_validated BOOLEAN DEFAULT FALSE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_operation (user_id, operation_id)
      )
    `);

    // Insérer toutes les opérations de multiplication (0 à 9)
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        await connection.query(
          `INSERT IGNORE INTO operations (number1, number2) VALUES (?, ?)`,
          [i, j]
        );
      }
    }

    console.log('Base de données initialisée avec succès');
    await connection.end();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

module.exports = { createConnection, initDatabase };
