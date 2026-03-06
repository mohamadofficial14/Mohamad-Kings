// --- 1. Variables and State ---
let selectedSquare = null;
const playerColor = Math.random() < 0.5 ? 'orange' : 'brown';
let currentTurn = 'orange'; 
let gameActive = true;

const orangeTeam = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'];
const brownTeam  = ['🤴', '💂', '🕍', '🚙', '🦄', '🏇', '💠'];

let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

// --- 2. Board Rendering ---
function drawBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = ''; 

    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            
            // Checkerboard pattern logic
            if ((row + col) % 2 === 0) {
                square.classList.add('orange-sq');
            } else {
                square.classList.add('brown-sq');
            }

            square.innerText = gameState[row][col];
            
            // Highlight selection
            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
                square.style.border = "4px solid yellow";
            }

            square.onclick = () => handleSquareClick(row, col);
            boardElement.appendChild(square);
        }
    }
}

// --- 3. Speech Logic ---
function botSpeak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    const voices = window.speechSynthesis.getVoices();
    speech.voice = voices.find(v => v.name.includes('Male') || v.name.includes('UK')) || voices[0];
    speech.pitch = 0.9;
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
}

// --- 4. Interaction & Logic ---
function handleSquareClick(row, col) {
    if (!gameActive || currentTurn !== playerColor) return;
    
    const piece = gameState[row][col];
    
    if (!selectedSquare) {
        if (piece === ' ') return;
        if (currentTurn === 'orange' && !orangeTeam.includes(piece)) return;
        if (currentTurn === 'brown' && !brownTeam.includes(piece)) return;
        selectedSquare = { row, col };
        drawBoard();
    } else {
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            executeMove(row, col);
        } else {
            selectedSquare = null;
            drawBoard();
        }
    }
}

// Placeholder functions to prevent errors
function isValidMove(r1, c1, r2, c2) { return true; } 
function executeMove(r2, c2) { 
    gameState[r2][c2] = gameState[selectedSquare.row][selectedSquare.col];
    gameState[selectedSquare.row][selectedSquare.col] = ' ';
    selectedSquare = null;
    currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
    drawBoard();
}
function makeSmartAIMove() { console.log("Bot is thinking..."); }

// --- 5. Initialization ---
window.onload = () => {
    document.getElementById('status').innerText = `You are ${playerColor.toUpperCase()}.`;
    drawBoard();
};
