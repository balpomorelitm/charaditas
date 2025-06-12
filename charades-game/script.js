// Game State
let allWords = [];
let currentDeck = [];
let timer;
let timeLeft;
let gameInProgress = false;
let currentLanguage = 'en';
let timeSetting = 90;

// Translation Dictionary
const translations = {
    en: {
        newGame: 'New Game',
        clickToStart: 'Click Deck to Start',
        timeLabel: 'Time per card (s):'
    },
    es: {
        newGame: 'Nueva Partida',
        clickToStart: 'Clica para Empezar',
        timeLabel: 'Tiempo por tarjeta (s):'
    }
};

// DOM Elements
let newGameBtn, langToggleBtn, cardDeck, cardDisplay, emojiEl, wordEl, levelEl, timerDisplay, timeInput;

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

    fetchWords();

    newGameBtn.addEventListener('click', startGame);
    cardDeck.addEventListener('click', () => {
        if (!gameInProgress) startGame();
    });
    langToggleBtn.addEventListener('click', toggleLanguage);
    timeInput.addEventListener('change', updateTimeSetting);
}

function fetchWords() {
    fetch('words.json')
        .then(resp => resp.json())
        .then(data => {
            allWords = data.A1 || [];
        })
        .catch(err => console.error('Failed to load words', err));
}

function startGame() {
    clearInterval(timer);
    gameInProgress = true;
    currentDeck = [...allWords];
    // Fisher-Yates shuffle
    for (let i = currentDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
    cardDeck.classList.add('hidden');
    cardDisplay.classList.remove('hidden');
    drawNextCard();
}

function drawNextCard() {
    if (currentDeck.length === 0) {
        endGame();
        return;
    }
    const card = currentDeck.pop();
    emojiEl.textContent = card.emoji;
    wordEl.textContent = card.word;
    levelEl.textContent = card.level;
    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timeLeft = timeSetting;
    timerDisplay.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            drawNextCard();
        }
    }, 1000);
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
    cardDisplay.classList.add('hidden');
    cardDeck.classList.remove('hidden');
    timerDisplay.textContent = '--';
}
