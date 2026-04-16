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

// --- UPDATED BRITISH BOT LOGIC ---
function botSpeak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    const voices = window.speechSynthesis.getVoices();
    
    // Look for a British English voice specifically
    // We try to find "Male" in the name for that 'Guy' feel
    let britishVoice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Male'));
    
    // Fallback to any British voice if Male isn't found
    if (!britishVoice) {
        britishVoice = voices.find(v => v.lang === 'en-GB');
    }

    if (britishVoice) {
        speech.voice = britishVoice;
    }

    speech.pitch = 0.8; // Slightly lower pitch for a more masculine tone
    speech.rate = 1.0;  // Standard speed
    window.speechSynthesis.speak(speech);
}

// --- RESIGN BUTTON ---
document.getElementById('resign-btn').onclick = () => {
    if (!gameActive) return;
    gameActive = false;
    const statusDisplay = document.getElementById('status');
    statusDisplay.innerText = "Match Resigned.";
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
       const eloChange = getRandomELO();
       
       if (currentTurn === 'brown') {
           statusDisplay.innerText = `Brown checkmated you! -${eloChange} ELO points.`;
           statusDisplay.style.color = "red";
           botSpeak("I say, I do love making your king go boom. Absolute rubbish play from you.");
           setTimeout(() => botSpeak("Way to tough it out, old sport. I respect that. Truly."), 3500);

           for (let r = 0; r < 10; r++) {
               for (let c = 0; c < 10; c++) {
                   if (orangeTeam.includes(gameState[r][c])) {
                       gameState[r][c] = ' ';
                   }
               }
           }
       } else {
           statusDisplay.innerText = `Checkmate!+${eloChange} ELO points added.`;
           statusDisplay.style.color = "orange";

           for (let r = 0; r < 10; r++) {
               for (let c = 0; c < 10; c++) {
                   if (brownTeam.includes(gameState[r][c])) {
                       gameState[r][c] = ' ';
                   }
               }
           }
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

// --- AI LOGIC ---
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

// Initial load of voices
window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
};

drawBoard();
