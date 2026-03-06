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

// --- SPEECH LOGIC ---
function botSpeak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    const voices = window.speechSynthesis.getVoices();
    speech.voice = voices.find(v => v.lang.includes('en-GB')) || voices[0];
    speech.pitch = 0.9;
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
}

// --- RESIGN BUTTON ---
document.getElementById('resign-btn').onclick = () => {
    if (!gameActive) return;
    gameActive = false;
    const statusDisplay = document.getElementById('status');
    statusDisplay.innerText = "You resigned!";
    statusDisplay.style.color = "maroon";
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

function checkRepetition() {
    const currentState = JSON.stringify(gameState);
    moveHistory.push(currentState);
    const count = moveHistory.filter(s => s === currentState).length;
    
    if (count >= 3) {
        gameActive = false;
        const statusDisplay = document.getElementById('status');
        statusDisplay.innerText = "Stalemate by Repetition";
        statusDisplay.style.color = "red";
    }
}

function handleSquareClick(row, col) {
    if (!gameActive) return;
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

function isValidMove(fR, fC, tR, tC) {
    const piece = gameState[fR][fC];
    const target = gameState[tR][tC];
    const dr = Math.abs(tR - fR);
    const dc = Math.abs(tC - fC);

    if (currentTurn === 'orange' && orangeTeam.includes(target)) return false;
    if (currentTurn === 'brown' && brownTeam.includes(target)) return false;
    if (fR === tR && fC === tC) return false;

    if (piece === '🛡️' || piece === '💂') return dc === 0 && dr === 1;
    if (piece === '👑' || piece === '🤴' || piece === '🏎️' || piece === '🚙') return (dr <= 2 && dc <= 2);
    if (piece === '🕌' || piece === '🕍') return ((dr <= 5 && dc === 0) || (dr === 0 && dc <= 5));
    if (piece === '🐎' || piece === '🦄') return (dr <= 1 && dc <= 1);
    
    return false;
}

function executeMove(row, col) {
    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;
    const movingPiece = gameState[fromRow][fromCol];
    const pieceOnTarget = gameState[row][col];
    const statusDisplay = document.getElementById('status');

    if (pieceOnTarget === '👑' || pieceOnTarget === '🤴') {
       gameActive = false;
       if (currentTurn === 'brown') {
           statusDisplay.innerText = "Brown fallmated you! -13 ELO points.";
           statusDisplay.style.color = "red";
           botSpeak("Dear Diary, today I won another match.");
           setTimeout(() => botSpeak("You didn't give up and that shows courage."), 3000);
       } else {
           statusDisplay.innerText = "Fallmate. Orange Wins! +11 ELO points added.";
           statusDisplay.style.color = "orange";
       }
    }

    gameState[row][col] = movingPiece;
    gameState[fromRow][fromCol] = ' ';
    
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

// --- UPDATED AI LOGIC ---
function makeSmartAIMove() {
    let possibleMoves = [];
    
    // 1. Scan for all valid moves
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (brownTeam.includes(gameState[r][c])) {
                for (let tr = 0; tr < 10; tr++) {
                    for (let tc = 0; tc < 10; tc++) {
                        if (isValidMove(r, c, tr, tc)) {
                            let score = 0;
                            const targetPiece = gameState[tr][tc];
                            
                            // Scoring logic
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
        // 2. Find the highest score available on the board
        const maxScore = Math.max(...possibleMoves.map(m => m.score));

        // 3. Filter to ONLY keep moves that have that max score
        const bestMoves = possibleMoves.filter(m => m.score === maxScore);

        // 4. PICK A RANDOM MOVE from the best ones! 🎲
        const chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

        // Execute
        selectedSquare = { row: chosenMove.fR, col: chosenMove.fC };
        executeMove(chosenMove.tR, chosenMove.tC);
    }
}

window.speechSynthesis.getVoices();
drawBoard();
