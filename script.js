let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;

// Keep track of board states for repetition
let moveHistory = [];

const orangeTeam = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'];
const brownTeam  = ['🤴', '💂', '🕍', '🚙', '🦄', '🏇', '💠'];

// Initial Game Setup
let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

// --- HELPER LOGIC ---
function getRandomELO() {
    return Math.floor(Math.random() * (15 - 5 + 1)) + 5;
}

function botSpeak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    const voices = window.speechSynthesis.getVoices();
    let britishVoice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Male'));
    if (!britishVoice) {
        britishVoice = voices.find(v => v.lang === 'en-GB');
    }
    if (britishVoice) {
        speech.voice = britishVoice;
    }
    speech.pitch = 0.8; 
    speech.rate = 1.0;  
    window.speechSynthesis.speak(speech);
}

// Check if only kings are left
function checkInsufficientMaterial() {
    let pieceCount = 0;
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (gameState[r][c] !== ' ') {
                pieceCount++;
            }
        }
    }

    // If only 2 pieces are left, they must be the kings
    if (pieceCount === 2) {
        gameActive = false;
        const statusDisplay = document.getElementById('status');
        statusDisplay.innerText = "This is a draw!";
        statusDisplay.style.color = "yellow";
        botSpeak("Draw! We can't checkmate with these measly pieces.");
        return true;
    }
    return false;
}

// --- RESIGN BUTTON ---
document.getElementById('resign-btn').onclick = () => {
    if (!gameActive) return;
    gameActive = false;
    const statusDisplay = document.getElementById('status');
    statusDisplay.innerText = "Match resigned.";
    statusDisplay.style.color = "red";
};

function drawBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';
    gameState.forEach((row, r) => {
        row.forEach((piece, c) => {
            const square = document.createElement('div');
            square.className = `square ${(r + c) % 2 === 0 ? 'orange-sq' : 'brown-sq'}`;
            square.innerText = piece;
            if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) {
                square.style.backgroundColor = "yellow"; 
            }
            square.onclick = () => handleSquareClick(r, c);
            boardElement.appendChild(square);
        });
    });
}

// Optimized Repetition Check
function checkRepetition() {
    const currentState = JSON.stringify(gameState);
    moveHistory.push(currentState);
    
    // Only look at the last 12 moves for efficiency (standard for 3-fold)
    const recentHistory = moveHistory.slice(-20);
    const count = recentHistory.filter(s => s === currentState).length;
    
    if (count >= 3) {
        gameActive = false;
        const statusDisplay = document.getElementById('status');
        statusDisplay.innerText = "Stalemate: The Infinite Loop!";
        statusDisplay.style.color = "yellow";
        botSpeak("We're going in circles, mate. Call it a draw?");
    }
}

// Enhanced Win Condition (The "Toasted" Sequence)
function executeMove(row, col) {
    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;
    const movingPiece = gameState[fromRow][fromCol];
    const pieceOnTarget = gameState[row][col];
    const statusDisplay = document.getElementById('status');

    if (pieceOnTarget === '👑' || pieceOnTarget === '🤴') {
       gameActive = false;
       
       if (currentTurn === 'brown') {
           // AI WINS
           statusDisplay.innerHTML = "<b>TOASTED.</b> 🔥<br>Feel the heat? That's just my CPU winning.";
           statusDisplay.style.color = "#FF4500"; // Deeper orange-red
           botSpeak("Honestly? I thought you had me there.");
           
           // Delayed laugh for maximum emotional damage
           setTimeout(() => botSpeak("Hahahahaha. Better luck next time, human."), 2500);

           clearTeam('orange');
       } else {
           // PLAYER WINS
           statusDisplay.innerHTML = "<b>Recycle Bin Emptied!</b> 🗑️<br>System clean. You actually won!";
           statusDisplay.style.color = "#00FF00";
           botSpeak("Wait... was that a legal move? My circuits hurt.");
           
           clearTeam('brown');
       }
    }

    gameState[row][col] = movingPiece;
    gameState[fromRow][fromCol] = ' ';
    
    // UI Update
    if (gameActive) {
        checkInsufficientMaterial();
        checkRepetition();
        currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
        statusDisplay.innerText = currentTurn === 'orange' ? "Your Move!" : "AI is calculating your demise...";
    }
    
    selectedSquare = null;
    drawBoard();

    if (gameActive && currentTurn === 'brown') {
        setTimeout(makeSmartAIMove, 800); 
    }
}

// Helper to clear the losers off the board
function clearTeam(teamColor) {
    const teamSet = teamColor === 'orange' ? orangeTeam : brownTeam;
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (teamSet.includes(gameState[r][c])) gameState[r][c] = ' ';
        }
    }
}


    gameState[row][col] = movingPiece;
    gameState[fromRow][fromCol] = ' ';
    
    // Check for draw by insufficient material
    if (gameActive) {
        checkInsufficientMaterial();
    }

    if (gameActive) {
        checkRepetition();
    }
    
    if (gameActive) {
        currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
        statusDisplay.innerText = currentTurn === 'orange' ? "Orange's Turn" : "Brown is thinking...";
    }
    
    selectedSquare = null;
    drawBoard();

    if (gameActive && currentTurn === 'brown') {
        setTimeout(makeSmartAIMove, 600); 
    }
}

function makeSmartAIMove() {
    let possibleMoves = [];
    
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (brownTeam.includes(gameState[r][c])) {
                for (let tr = 0; tr < 10; tr++) {
                    for (let tc = 0; tc < 10; tc++) {
                        if (isValidMove(r, c, tr, tc)) {
                            let score = 0;
                            const targetPiece = gameState[tr][tc];
                            
                            if (targetPiece === '👑') score = 1000;
                            else if (orangeTeam.includes(targetPiece)) score = 10;
                            
                            possibleMoves.push({fR: r, fC: c, tR: tr, tC: tc, score: score});
                        }
                    }
                }
            }
        }
    }

    if (possibleMoves.length > 0) {
        const maxScore = Math.max(...possibleMoves.map(m => m.score));
        const bestMoves = possibleMoves.filter(m => m.score === maxScore);
        const chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

        selectedSquare = { row: chosenMove.fR, col: chosenMove.fC };
        executeMove(chosenMove.tR, chosenMove.tC);
    }
}

window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
};

drawBoard();
