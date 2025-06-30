// Game State
let allWords = [];
let currentDeck = [];
let selectedLevels = ['A1', 'A2'];
let selectedTags = [];
let timer;
let timeLeft;
let gameInProgress = false;
let currentLanguage = 'en';
let timeSetting = 90;
let score = 0;
let firstGame = true;

// Translation Dictionary
const translations = {
    en: {
        newGame: 'New Game',
        clickToStart: 'Click Deck to Start',
        timeLabel: 'Round duration (s):',
        pass: 'Pass',
        correct: 'Correct',
        optionsTitle: 'Options',
        levelLabel: 'Level:',
        tagsLabel: 'Categories:',
        start: 'Start',
        selectAll: 'All of them!',
        selectNone: 'None of them!'
    },
    es: {
        newGame: 'Nueva Partida',
        clickToStart: 'Clica para Empezar',
        timeLabel: 'Duración de la ronda (s):',
        pass: 'Pasar',
        correct: '¡Correcto!',
        optionsTitle: 'Opciones',
        levelLabel: 'Nivel:',
        tagsLabel: 'Categorías:',
        start: 'Iniciar',
        selectAll: 'Todo',
        selectNone: 'Nada'
    }
};

// Mapping of tag names to emoji and translations
const tagInfo = {
    animal:   { emoji: '🐾', en: 'Animals',    es: 'Animales' },
    comida:   { emoji: '🍔', en: 'Food',       es: 'Comida' },
    hogar:    { emoji: '🏠', en: 'Home',       es: 'Hogar' },
    naturaleza: { emoji: '🌳', en: 'Nature',   es: 'Naturaleza' },
    objeto:   { emoji: '📦', en: 'Objects',    es: 'Objetos' },
    'país':     { emoji: '🌎', en: 'Countries',  es: 'Países' },
    persona:  { emoji: '🧑', en: 'People',     es: 'Personas' },
    'profesión':{ emoji: '👷', en: 'Jobs',       es: 'Profesiones' },
    ropa:     { emoji: '👕', en: 'Clothes',    es: 'Ropa' },
    transporte:{ emoji: '🚗', en: 'Transport', es: 'Transporte' },
    verbo:    { emoji: '✍️', en: 'Verbs',      es: 'Verbos' }
};

// DOM Elements
let newGameBtn, langToggleBtn, cardDeck, cardDisplay, emojiEl, wordEl, levelEl, timerDisplay, timeInput;
let actionButtons, passBtn, correctBtn;
let scoreDisplay, scoreValue, gameContainer;
let optionsTooltip, tagOptionsContainer, startGameBtn, toggleAllBtn;

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
    scoreDisplay = document.getElementById('score-display');
    scoreValue = document.getElementById('score-value');
    gameContainer = document.getElementById('game-container');
    optionsTooltip = document.getElementById('options-tooltip');
    tagOptionsContainer = document.getElementById('tag-options');
    startGameBtn = document.getElementById('start-game-btn');
    toggleAllBtn = document.getElementById('toggle-all-btn');

    fetchWords();

    newGameBtn.addEventListener('click', () => {
        optionsTooltip.classList.toggle('hidden');
    });
    cardDeck.addEventListener('click', () => {
        if (!gameInProgress) {
            if (firstGame) {
                optionsTooltip.classList.remove('hidden');
            } else {
                startGame();
            }
        }
    });
    langToggleBtn.addEventListener('click', toggleLanguage);
    timeInput.addEventListener('change', updateTimeSetting);
    passBtn.addEventListener('click', drawNextCard);
    correctBtn.addEventListener('click', handleCorrect);
    startGameBtn.addEventListener('click', applyOptionsAndStart);
    toggleAllBtn.addEventListener('click', toggleSelectAllTags);
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
    fetch('./words.json')
        .then(resp => resp.text())
        .then(text => {
            const lines = text.replace(/\r/g, '').split('\n');
            const items = [];
            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('//') || trimmed === '[' || trimmed === ']') return;
                const clean = trimmed.replace(/,$/, '');
                try {
                    items.push(JSON.parse(clean));
                } catch (e) {
                    console.error('Bad line in words.json', line);
                }
            });
            return items;
        })
        .then(data => {
            allWords = data;
            setupOptions();
        })
        .catch(err => console.error('Failed to load words', err));
}

function setupOptions() {
    const tags = [...new Set(allWords.map(w => w.tag))];
    // Remove old checkboxes but keep static children (label span & toggle button)
    tagOptionsContainer.querySelectorAll('label').forEach(el => el.remove());
    tags.forEach(tag => {
        const info = tagInfo[tag] || { emoji: '', en: tag, es: tag };
        const label = document.createElement('label');
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.value = tag;
        chk.checked = selectedTags.length === 0 || selectedTags.includes(tag);
        label.appendChild(chk);
        label.append(' ' + info.emoji + ' ' + info[currentLanguage]);
        // Insert checkboxes above the toggle button so it stays last
        tagOptionsContainer.insertBefore(label, toggleAllBtn);
    });
    toggleAllBtn.textContent = translations[currentLanguage].selectAll;
}

function applyOptionsAndStart() {
    const levelVal = document.querySelector('input[name="level-option"]:checked').value;
    selectedLevels = levelVal === 'both' ? ['A1', 'A2'] : [levelVal];
    selectedTags = Array.from(tagOptionsContainer.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
    optionsTooltip.classList.add('hidden');
    firstGame = false;
    prepareGame();
    startGame();
}

function startGame() {
    clearInterval(timer);
    gameInProgress = true;
    score = 0;
    scoreValue.textContent = score;
    gameContainer.classList.add('game-active');
    scoreDisplay.classList.remove('final-score');

    currentDeck = allWords.filter(w => selectedLevels.includes(w.level) && (selectedTags.length === 0 || selectedTags.includes(w.tag)));
    if (currentDeck.length === 0) {
        currentDeck = [...allWords];
    }
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
    const currentSelections = Array.from(tagOptionsContainer.querySelectorAll('input[type="checkbox"]'))
        .filter(c => c.checked)
        .map(c => c.value);
    if (currentSelections.length) {
        selectedTags = currentSelections;
    }
    setupOptions();
}

function toggleSelectAllTags() {
    const checkboxes = tagOptionsContainer.querySelectorAll('input[type="checkbox"]');
    const selectAll = toggleAllBtn.textContent === translations[currentLanguage].selectAll;
    checkboxes.forEach(c => c.checked = selectAll);
    toggleAllBtn.textContent = selectAll ? translations[currentLanguage].selectNone : translations[currentLanguage].selectAll;
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
