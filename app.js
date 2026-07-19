const colors = [
    { name: 'red', hex: '#ef4444' },
    { name: 'orange', hex: '#f97316' },
    { name: 'yellow', hex: '#eab308' },
    { name: 'green', hex: '#22c55e' },
    { name: 'blue', hex: '#3b82f6' },
    { name: 'purple', hex: '#a855f7' },
    { name: 'white', hex: '#f8fafc' },
    { name: 'grey', hex: '#64748b' },
    { name: 'black', hex: '#020617' },
    { name: 'brown', hex: '#78350f' }
];

const TOTAL_ROUNDS = 25;

let currentRound = 0;
let results = [];
let currentColorHex = null;
let startTime = 0;
let gameMode = 'random'; // 'random' or 'gradient'

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');

const startRandomBtn = document.getElementById('start-random-btn');
const startGradientBtn = document.getElementById('start-gradient-btn');
const restartBtn = document.getElementById('restart-btn');

const colorDisplay = document.getElementById('color-display');
const optionsContainer = document.getElementById('options-container');
const roundCounter = document.getElementById('round-counter');

// Start Game
startRandomBtn.addEventListener('click', () => startGame('random'));
startGradientBtn.addEventListener('click', () => startGame('gradient'));
restartBtn.addEventListener('click', () => switchScreen(startScreen));

function switchScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        setTimeout(() => {
            if (!s.classList.contains('active')) s.style.display = 'none';
        }, 500);
    });
    
    screen.style.display = 'block';
    // Trigger reflow
    void screen.offsetWidth;
    screen.classList.add('active');
}

function startGame(mode) {
    gameMode = mode;
    currentRound = 0;
    results = [];
    switchScreen(gameScreen);
    nextRound();
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function generateColor() {
    if (gameMode === 'random') {
        // Generate random hex
        return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    } else {
        // Gradient mode: pick two random base colors and interpolate
        const c1 = colors[Math.floor(Math.random() * colors.length)].hex;
        const c2 = colors[Math.floor(Math.random() * colors.length)].hex;
        const rgb1 = hexToRgb(c1);
        const rgb2 = hexToRgb(c2);
        
        const t = Math.random(); // interpolation factor
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
        
        return rgbToHex(r, g, b);
    }
}

function nextRound() {
    currentRound++;
    if (currentRound > TOTAL_ROUNDS) {
        endGame();
        return;
    }

    roundCounter.textContent = `Round: ${currentRound} / ${TOTAL_ROUNDS}`;
    
    currentColorHex = generateColor();
    colorDisplay.style.backgroundColor = currentColorHex;

    // Use all available colors as options
    let options = [...colors];

    // Render options
    optionsContainer.innerHTML = '';
    options.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = capitalize(color.name);
        btn.onclick = () => handleSelection(color.name, btn);
        optionsContainer.appendChild(btn);
    });

    startTime = performance.now();
}

function handleSelection(selectedName, btnElement) {
    const endTime = performance.now();
    const timeTaken = endTime - startTime;

    // Disable all buttons and show selection
    const allBtns = optionsContainer.querySelectorAll('.option-btn');
    allBtns.forEach(b => {
        b.disabled = true;
        b.style.cursor = 'default';
        if (b === btnElement) {
            b.classList.add('selected');
        }
    });

    // Record result
    results.push({
        round: currentRound,
        hexcode: currentColorHex,
        userSelection: selectedName,
        timeTaken: timeTaken
    });

    // Wait a brief moment before next round
    setTimeout(nextRound, 500);
}

function endGame() {
    switchScreen(resultsScreen);
    
    const totalTime = results.reduce((acc, curr) => acc + curr.timeTaken, 0);
    const avgTime = (totalTime / TOTAL_ROUNDS / 1000).toFixed(2);

    document.getElementById('time-result').textContent = `${avgTime}s`;

    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';

    results.forEach(res => {
        const item = document.createElement('div');
        item.className = 'result-item';
        
        item.innerHTML = `
            <div class="result-color-swatch" style="background-color: ${res.hexcode}; border: 1px solid rgba(255,255,255,0.2)"></div>
            <div class="result-info">
                <span>R${res.round}: ${res.hexcode}</span>
                <span style="color: white; font-weight: 600;">
                    Categorized as: ${capitalize(res.userSelection)}
                    <span style="font-weight: 400; color: #94a3b8; font-size: 0.9em;">(${ (res.timeTaken / 1000).toFixed(2) }s)</span>
                </span>
            </div>
        `;
        resultsList.appendChild(item);
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initial setup
document.querySelectorAll('.screen').forEach(s => {
    if (!s.classList.contains('active')) s.style.display = 'none';
});
