// Game State
let allWords = [];
let currentDeck = [];
let timer;
let timeLeft;
let gameInProgress = false;
let currentLanguage = 'en';
let timeSetting = 90;
let score = 0; // <-- AÑADIR ESTA LÍNEA

// Translation Dictionary
const translations = {
    en: {
        newGame: 'New Game',
        clickToStart: 'Click Deck to Start',
        timeLabel: 'Round duration (s):',
        pass: 'Pass',
        correct: 'Correct'
    },
    es: {
        newGame: 'Nueva Partida',
        clickToStart: 'Clica para Empezar',
        timeLabel: 'Duración de la ronda (s):',
        pass: 'Pasar',
        correct: '¡Correcto!'
    }
};

// DOM Elements
let newGameBtn, langToggleBtn, cardDeck, cardDisplay, emojiEl, wordEl, levelEl, timerDisplay, timeInput;
let actionButtons, passBtn, correctBtn;
let scoreDisplay, scoreValue, gameContainer; // <-- AÑADIR ESTA LÍNEA

document.addEventListener('DOMContentLoaded', init);

function init() {
    // Get DOM references
    newGameBtn = document.getElementById('new-game-btn');
    langToggleBtn = document.getElementById('lang-toggle-btn');
    cardDeck = document.getElementById('card-deck');
    cardDisplay = document.getElementById('card-display');
    emojiEl = document.getElementById('emoji');
    wordEl = document.getElementById('word');
    levelEl = document.getElementById('level');
    timerDisplay = document.getElementById('timer-display');
    timeInput = document.getElementById('time-input');
    actionButtons = document.getElementById('action-buttons');
    passBtn = document.getElementById('pass-btn');
    correctBtn = document.getElementById('correct-btn');
    scoreDisplay = document.getElementById('score-display'); // <-- AÑADIR ESTA LÍNEA
    scoreValue = document.getElementById('score-value'); // <-- AÑADIR ESTA LÍNEA
    gameContainer = document.getElementById('game-container'); // <-- AÑADIR ESTA LÍNEA

    fetchWords();

    newGameBtn.addEventListener('click', prepareGame);
    cardDeck.addEventListener('click', () => {
        if (!gameInProgress) startGame();
    });
    langToggleBtn.addEventListener('click', toggleLanguage);
    timeInput.addEventListener('change', updateTimeSetting);
    passBtn.addEventListener('click', drawNextCard);
    correctBtn.addEventListener('click', handleCorrect); // <-- CAMBIAR A handleCorrect
}

function prepareGame() {
    clearInterval(timer);
    gameInProgress = false;
    score = 0;
    scoreValue.textContent = score;
    timerDisplay.textContent = '--';
    const cardArea = document.getElementById('card-area');
    cardArea.classList.remove('is-flipped');
    actionButtons.classList.add('hidden');
    cardDisplay.classList.add('hidden');
    scoreDisplay.classList.remove('final-score');
    gameContainer.classList.add('game-active');
}

// Justo después de la función init(), añade esta nueva función:
function handleCorrect() {
    score++;
    scoreValue.textContent = score;
    scoreDisplay.classList.add('score-pulse');

    // Eliminar la clase de animación para que se pueda volver a activar
    setTimeout(() => {
        scoreDisplay.classList.remove('score-pulse');
    }, 400);

    drawNextCard();
}

function fetchWords() {
    // Use a relative path so the game works regardless of the hosting folder
    fetch('./words.json')
        .then(resp => resp.json())
        .then(data => {
            allWords = data.A1 || [];
        })
        .catch(err => console.error('Failed to load words', err));
}

function startGame() {
    clearInterval(timer);
    gameInProgress = true;
    score = 0; // <-- Reiniciar puntuación
    scoreValue.textContent = score; // <-- Actualizar display
    gameContainer.classList.add('game-active'); // <-- Mostrar marcador
    scoreDisplay.classList.remove('final-score');

    currentDeck = [...allWords];
    // Fisher-Yates shuffle
    for (let i = currentDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
    const cardArea = document.getElementById('card-area');
    cardArea.classList.add('is-flipped');

    const themes = ['deck-theme-red', 'deck-theme-blue', 'deck-theme-purple', 'deck-theme-orange'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    cardDeck.classList.remove(...themes);
    cardDeck.classList.add(randomTheme);

    cardDisplay.classList.remove('hidden');
    actionButtons.classList.remove('hidden');
    drawNextCard();

    // --- NUEVA LÓGICA DEL TEMPORIZADOR DE RONDA ---
    timeLeft = timeSetting;
    timerDisplay.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame(); // El juego termina cuando el tiempo se agota
        }
    }, 1000);
}

function drawNextCard() {
    if (currentDeck.length === 0) {
        endGame();
        return;
    }

    const cardStyleCount = 7;
    const randomStyle = `card-style-${Math.floor(Math.random() * cardStyleCount) + 1}`;
    for (let i = 1; i <= cardStyleCount; i++) {
        cardDisplay.classList.remove(`card-style-${i}`);
    }
    cardDisplay.classList.add(randomStyle);

    const card = currentDeck.pop();
    emojiEl.textContent = card.emoji;
    wordEl.textContent = card.word;
    // Ajuste dinámico del tamaño de fuente para palabras largas
    const baseSize = 3.1; // tamaño por defecto en rem ligeramente menor
    let fontSize = baseSize - Math.max(0, card.word.length - 5) * 0.35;
    fontSize = Math.max(fontSize, 1.5); // límite inferior para no hacerlas ilegibles
    wordEl.style.fontSize = fontSize + 'rem';
    levelEl.textContent = card.level;
}



function updateTimeSetting() {
    const val = parseInt(timeInput.value, 10);
    if (!isNaN(val)) {
        timeSetting = val;
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
    langToggleBtn.textContent = currentLanguage === 'en' ? 'Español' : 'English';
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        el.textContent = translations[currentLanguage][key];
    });
}

function endGame() {
    gameInProgress = false;
    clearInterval(timer);
    const cardArea = document.getElementById('card-area');
    cardArea.classList.remove('is-flipped');
    actionButtons.classList.add('hidden');
    timerDisplay.textContent = '--';
    scoreDisplay.classList.add('final-score');
}
