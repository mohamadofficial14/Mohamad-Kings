let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;

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
    // Try to find a nice sounding male voice
    speech.voice = voices.find(v => v.name.includes('Male') || v.name.includes('UK')) || voices[0];
    speech.pitch = 0.9;
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
}

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
           statusDisplay.innerText = "Brown Fallmated you!";
           statusDisplay.style.color = "red";
           // Bot speaks its lines!
           botSpeak("Dear Diary, today I won another match.");
           setTimeout(() => botSpeak("You didn't give up and that shows courage."), 3000);
       } else {
           statusDisplay.innerText = "Fallmate! Orange Wins!";
           statusDisplay.style.color = "orange";
       }
    }

    gameState[row][col] = movingPiece;
    gameState[fromRow][fromCol] = ' ';
    
    if (gameActive) {
        currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
        statusDisplay.innerText = currentTurn === 'orange' ? "Orange's Turn" : "Brown is thinking...";
    }
    
    selectedSquare = null;
    drawBoard();

    if (gameActive && currentTurn === 'brown') {
        setTimeout(makeSmartAIMove, 2100); 
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
        possibleMoves.sort((a, b) => b.score - a.score);
        const bestMove = possibleMoves[0];
        selectedSquare = { row: bestMove.fR, col: bestMove.fC };
        executeMove(bestMove.tR, bestMove.tC);
    }
}

// Prepare voices (some browsers need this)
window.speechSynthesis.getVoices();
drawBoard();
