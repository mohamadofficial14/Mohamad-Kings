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

// --- 2. Speech Logic ---
function botSpeak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    const voices = window.speechSynthesis.getVoices();
    speech.voice = voices.find(v => v.name.includes('Male') || v.name.includes('UK')) || voices[0];
    speech.pitch = 0.9;
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
}

function resign() {
    if (!gameActive) return;
    if (confirm("Are you sure you want to resign and give the bot the win?")) {
        gameActive = false;
        document.getElementById('status').innerText = "You resigned! Bot wins!";
        botSpeak("Victory is mine. You fought well.");
    }
}

// --- 3. Interaction Logic ---
function handleSquareClick(row, col) {
    // Only allow moves if game is active AND it's the player's turn
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

// --- 4. Initialization ---
window.onload = () => {
    // Sync voices
    window.speechSynthesis.getVoices();
    
    document.getElementById('status').innerText = `You are ${playerColor.toUpperCase()}. Current turn: Orange`;
    
    // If the random assignment makes the player Brown, the bot goes first
    if (playerColor === 'brown') {
        setTimeout(makeSmartAIMove, 1000);
    }
    drawBoard();
};
