# Application d'Apprentissage des Tables de Multiplication

Application web interactive pour aider les enfants à apprendre les tables de multiplication de 0 à 9.

## 📋 Fonctionnalités

- ✅ Questions aléatoires avec 4 choix de réponses
- ✅ Système de validation progressive sur 5 niveaux
- ✅ Réinitialisation à 0 en cas de mauvaise réponse
- ✅ Barre de progression visuelle (0% à 100%)
- ✅ Validation complète des opérations après 5 bonnes réponses consécutives
- ✅ Les opérations validées ne s'affichent plus
- ✅ Stockage des données dans MySQL
- ✅ Interface colorée et ludique pour les enfants

## 🛠️ Technologies Utilisées

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js avec Express
- **Base de données**: MySQL
- **Architecture**: API RESTful

## 📦 Installation

### Prérequis

- Node.js (version 14 ou supérieure)
- MySQL Server (version 5.7 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Installer MySQL** (si ce n'est pas déjà fait)
   - Téléchargez et installez MySQL depuis https://dev.mysql.com/downloads/
   - Notez votre nom d'utilisateur et mot de passe

2. **Cloner ou télécharger le projet**
   ```bash
   cd multiplication-app
   ```

3. **Installer les dépendances**
   ```bash
   npm install
   ```

4. **Configurer la base de données**
   - Ouvrez le fichier `database.js`
   - Modifiez les paramètres de connexion :
     ```javascript
     const dbConfig = {
       host: 'localhost',
       user: 'root',              // Votre utilisateur MySQL
       password: 'votre_mot_de_passe',  // Votre mot de passe MySQL
       database: 'multiplication_db'
     };
     ```

5. **Démarrer l'application**
   ```bash
   npm start
   ```
   
   Ou en mode développement avec auto-rechargement :
   ```bash
   npm run dev
   ```

6. **Accéder à l'application**
   - Ouvrez votre navigateur à l'adresse : http://localhost:3000

## 🎮 Utilisation

1. **Démarrage**
   - Entre ton prénom sur l'écran d'accueil
   - Clique sur "Commencer"

2. **Jouer**
   - Une opération de multiplication s'affiche
   - Choisis la bonne réponse parmi les 4 proposées
   - Si c'est correct : tu gagnes une étoile ⭐
   - Si c'est faux : tu reviens à 0 étoile
   - Après 5 bonnes réponses (5 étoiles), l'opération est validée !

3. **Progression**
   - La barre en haut montre ta progression globale
   - Chaque opération validée = 1% de progression
   - Objectif : atteindre 100% en validant les 100 opérations (0×0 jusqu'à 9×9)

4. **Fin du jeu**
   - Quand toutes les opérations sont validées, tu reçois un trophée 🏆
   - Tu peux recommencer ou consulter ta progression détaillée

## 🗄️ Structure de la Base de Données

### Table `users`
- `id`: Identifiant unique de l'utilisateur
- `name`: Nom de l'utilisateur
- `created_at`: Date de création

### Table `operations`
- `id`: Identifiant unique de l'opération
- `number1`: Premier nombre (0-9)
- `number2`: Deuxième nombre (0-9)

### Table `user_progress`
- `id`: Identifiant unique
- `user_id`: Référence à l'utilisateur
- `operation_id`: Référence à l'opération
- `validation_level`: Niveau de validation (0-5)
- `is_validated`: Booléen indiquant si l'opération est complètement validée
- `last_updated`: Date de dernière mise à jour

## 📡 API Endpoints

### POST `/api/users`
Créer un nouvel utilisateur
```json
{
  "name": "Alice"
}
```

### GET `/api/question/:userId`
Récupérer une question aléatoire pour l'utilisateur

### POST `/api/answer`
Vérifier une réponse
```json
{
  "userId": 1,
  "operationId": 15,
  "answer": 18,
  "correctAnswer": 18
}
```

### GET `/api/progress/:userId`
Récupérer la progression globale de l'utilisateur

### GET `/api/progress-details/:userId`
Récupérer les détails de progression pour toutes les opérations

## 🎨 Personnalisation

### Modifier les couleurs
Éditez le fichier `public/style.css` :
- Gradient principal : `#667eea` et `#764ba2`
- Réponses correctes : `#28a745`
- Réponses incorrectes : `#dc3545`

### Modifier le nombre de validations
Dans `server.js`, changez la condition :
```javascript
const isValidated = newLevel >= 5; // Changez 5 par le nombre souhaité
```

## 🐛 Dépannage

### Erreur de connexion MySQL
- Vérifiez que MySQL est démarré
- Vérifiez vos identifiants dans `database.js`
- Assurez-vous que le port 3306 est disponible

### L'application ne démarre pas
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Installez à nouveau les dépendances : `npm install`
- Vérifiez la version de Node.js : `node --version`

### Les questions ne s'affichent pas
- Ouvrez la console du navigateur (F12)
- Vérifiez que l'API répond correctement
- Redémarrez le serveur

## 📝 Améliorations Possibles

- Ajouter des niveaux de difficulté (tables jusqu'à 12)
- Implémenter un système de récompenses
- Ajouter des sons pour les bonnes/mauvaises réponses
- Créer un classement entre plusieurs enfants
- Ajouter des statistiques de temps de réponse
- Sauvegarder l'historique des sessions

## 📄 Licence

Ce projet est libre d'utilisation pour un usage éducatif.

## 👨‍💻 Auteur

Application développée pour l'apprentissage ludique des mathématiques.

---

Bon apprentissage ! 🎯📚
