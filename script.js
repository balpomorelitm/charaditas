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
let actionButtons, passBtn, correctBtn;

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

    fetchWords();

    newGameBtn.addEventListener('click', startGame);
    cardDeck.addEventListener('click', () => {
        if (!gameInProgress) startGame();
    });
    langToggleBtn.addEventListener('click', toggleLanguage);
    timeInput.addEventListener('change', updateTimeSetting);
    passBtn.addEventListener('click', drawNextCard);
    correctBtn.addEventListener('click', drawNextCard);
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
    const cardArea = document.getElementById('card-area');
    cardArea.classList.remove('is-flipped');
    actionButtons.classList.add('hidden');
    timerDisplay.textContent = '--';
}
