// Variables globales
let userId = null;
let currentQuestion = null;
let userName = '';

// Éléments DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const completionScreen = document.getElementById('completion-screen');
const usernameInput = document.getElementById('username');
const startBtn = document.getElementById('start-btn');
const displayName = document.getElementById('display-name');
const number1Elem = document.getElementById('number1');
const number2Elem = document.getElementById('number2');
const answersGrid = document.getElementById('answers-grid');
const feedbackElem = document.getElementById('feedback');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const validationStars = document.getElementById('validation-stars');
const restartBtn = document.getElementById('restart-btn');
const viewProgressBtn = document.getElementById('view-progress-btn');
const progressModal = document.getElementById('progress-modal');
const closeModalBtn = document.querySelector('.close-modal');
const closeProgressBtn = document.getElementById('close-progress-btn');
const progressGrid = document.getElementById('progress-grid');

// Événements
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => location.reload());
viewProgressBtn.addEventListener('click', showProgressDetails);
closeModalBtn.addEventListener('click', () => progressModal.classList.remove('active'));
closeProgressBtn.addEventListener('click', () => progressModal.classList.remove('active'));

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startGame();
});

// Démarrer le jeu
async function startGame() {
    userName = usernameInput.value.trim();
    
    if (!userName) {
        alert('Entre ton prénom pour commencer !');
        return;
    }
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: userName })
        });
        
        const data = await response.json();
        userId = data.userId;
        displayName.textContent = `👋 Salut ${userName} !`;
        
        startScreen.classList.remove('active');
        gameScreen.classList.add('active');
        
        loadQuestion();
        updateProgress();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du démarrage. Vérifie que le serveur est lancé.');
    }
}

// Charger une nouvelle question
async function loadQuestion() {
    try {
        feedbackElem.textContent = '';
        feedbackElem.className = 'feedback';
        
        const response = await fetch(`/api/question/${userId}`);
        const data = await response.json();
        
        if (data.completed) {
            showCompletion();
            return;
        }
        
        currentQuestion = data;
        
        // Afficher la question
        number1Elem.textContent = data.number1;
        number2Elem.textContent = data.number2;
        
        // Afficher les étoiles de validation
        displayValidationStars(data.validationLevel);
        
        // Afficher les réponses
        answersGrid.innerHTML = '';
        data.answers.forEach(answer => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = answer;
            btn.addEventListener('click', () => checkAnswer(answer));
            answersGrid.appendChild(btn);
        });
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement de la question.');
    }
}

// Afficher les étoiles de validation
function displayValidationStars(level) {
    validationStars.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        if (i < level) {
            star.textContent = '⭐';
            star.classList.add('filled');
        } else {
            star.textContent = '☆';
        }
        validationStars.appendChild(star);
    }
}

// Vérifier la réponse
async function checkAnswer(answer) {
    try {
        // Désactiver tous les boutons
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        const response = await fetch('/api/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                operationId: currentQuestion.operationId,
                answer,
                correctAnswer: currentQuestion.correctAnswer
            })
        });
        
        const data = await response.json();
        
        // Afficher le feedback
        buttons.forEach(btn => {
            if (parseInt(btn.textContent) === currentQuestion.correctAnswer) {
                btn.classList.add('correct');
            } else if (parseInt(btn.textContent) === answer && !data.isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        if (data.isCorrect) {
            feedbackElem.textContent = '✓ Bravo ! Bonne réponse !';
            feedbackElem.className = 'feedback correct';
            
            // Mettre à jour les étoiles si la réponse est correcte
            const newLevel = Math.min(currentQuestion.validationLevel + 1, 5);
            displayValidationStars(newLevel);
        } else {
            feedbackElem.textContent = `✗ Oups ! La bonne réponse est ${currentQuestion.correctAnswer}`;
            feedbackElem.className = 'feedback incorrect';
            
            // Réinitialiser les étoiles
            displayValidationStars(0);
        }
        
        // Mettre à jour la progression
        await updateProgress();
        
        // Charger la prochaine question après un délai
        setTimeout(() => {
            loadQuestion();
        }, 2000);
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la vérification de la réponse.');
    }
}

// Mettre à jour la barre de progression
async function updateProgress() {
    try {
        const response = await fetch(`/api/progress/${userId}`);
        const data = await response.json();
        
        progressFill.style.width = `${data.percentage}%`;
        progressText.textContent = `${data.percentage}%`;
        
        if (data.percentage === 100) {
            setTimeout(showCompletion, 1000);
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Afficher l'écran de félicitations
function showCompletion() {
    gameScreen.classList.remove('active');
    completionScreen.classList.add('active');
}

// Afficher les détails de progression
async function showProgressDetails() {
    try {
        const response = await fetch(`/api/progress-details/${userId}`);
        const data = await response.json();
        
        progressGrid.innerHTML = '';
        
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'progress-item';
            if (item.is_validated) {
                div.classList.add('validated');
            }
            
            div.innerHTML = `
                <div class="operation">${item.number1} × ${item.number2}</div>
                <div class="level">${item.is_validated ? '✓ Validé' : `${item.validation_level}/5`}</div>
            `;
            progressGrid.appendChild(div);
        });
        
        progressModal.classList.add('active');
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement de la progression.');
    }
}

// Fermer le modal en cliquant en dehors
window.addEventListener('click', (e) => {
    if (e.target === progressModal) {
        progressModal.classList.remove('active');
    }
});
