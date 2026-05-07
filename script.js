let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;
let moveHistory = [];

const orangeTeam = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'];
const brownTeam  = ['🤴', '💂', '🕍', '🚙', '🦄', '🏇', '💠'];

// Initial Game Setup (10x10)
let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

// --- STALEMATE SCANNER ---
// This checks if the player has ANY valid moves left on the board
function canPlayerMove(playerColor) {
    const team = (playerColor === 'orange') ? orangeTeam : brownTeam;
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (team.includes(gameState[r][c])) {
                for (let tr = 0; tr < 10; tr++) {
                    for (let tc = 0; tc < 10; tc++) {
                        if (isValidMove(r, c, tr, tc)) return true;
                    }
                }
            }
        }
    }
    return false;
}

function getRandomELO() {
    return Math.floor(Math.random() * (15 - 5 + 1)) + 5;
}

function botSpeak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    const voices = window.speechSynthesis.getVoices();
    let britishVoice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Male')) || voices.find(v => v.lang === 'en-GB');
    if (britishVoice) speech.voice = britishVoice;
    speech.pitch = 0.8; 
    speech.rate = 1.0;  
    window.speechSynthesis.speak(speech);
}

function checkInsufficientMaterial() {
    let pieceCount = 0;
    gameState.forEach(row => row.forEach(p => { if(p !== ' ') pieceCount++; }));
    if (pieceCount === 2) {
        endGame("Draw! We can't checkmate with these measly pieces.", "yellow");
        return true;
    }
    return false;
}

function endGame(msg, color) {
    gameActive = false;
    const statusDisplay = document.getElementById('status');
    statusDisplay.innerText = msg;
    statusDisplay.style.color = color;
    botSpeak(msg);
}

document.getElementById('resign-btn').onclick = () => {
    if (gameActive) endGame("Match resigned.", "red");
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
    if (count >= 3) endGame("Stalemate by Repetition", "yellow");
}

function handleSquareClick(row, col) {
    if (!gameActive) return;
    const piece = gameState[row][col];
    if (!selectedSquare) {
        if (piece === ' ' || (currentTurn === 'orange' && !orangeTeam.includes(piece)) || (currentTurn === 'brown' && !brownTeam.includes(piece))) return;
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
    const dr = Math.abs(tR - fR), dc = Math.abs(tC - fC);
    if ((currentTurn === 'orange' && orangeTeam.includes(target)) || (currentTurn === 'brown' && brownTeam.includes(target)) || (fR === tR && fC === tC)) return false;

    if (piece === '🛡️' || piece === '💂') return dc === 0 && dr === 1;
    if (piece === '👑' || piece === '🤴') return (dr <= 1 && dc <= 1);
    if (piece === '🏎️' || piece === '🚙') return (dr <= 2 && dc <= 2);
    if (piece === '🕌' || piece === '🕍') return ((dr <= 5 && dc === 0) || (dr === 0 && dc <= 5));
    if (piece === '🐎' || piece === '🦄') return (dr <= 1 && dc <= 1);
    return false;
}

function executeMove(row, col) {
    const fromRow = selectedSquare.row, fromCol = selectedSquare.col;
    const movingPiece = gameState[fromRow][fromCol], pieceOnTarget = gameState[row][col];
    const statusDisplay = document.getElementById('status');

    if (pieceOnTarget === '👑' || pieceOnTarget === '🤴') {
       gameActive = false;
       if (currentTurn === 'brown') {
           statusDisplay.innerHTML = "<b>Toasted.</b>";
           endGame("Honestly? I thought you had me there.", "red");
           setTimeout(() => botSpeak("Hahahahahahahaha"), 3500);
       } else {
           statusDisplay.innerText = `You emptied their Windows Recycle Bin! Don't ask me how, but you did it! 🎊 🎉 🙌 `;
           statusDisplay.style.color = "lime";
       }
    }

    gameState[row][col] = movingPiece;
    gameState[fromRow][fromCol] = ' ';
    
    if (gameActive) {
        checkInsufficientMaterial();
        checkRepetition();
    }

    if (gameActive) {
        currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
        
        // CHECK FOR STALEMATE
        if (!canPlayerMove(currentTurn)) {
            endGame("Stalemate! No legal moves left.", "cyan");
        } else {
            statusDisplay.innerText = currentTurn === 'orange' ? "Orange's Turn" : "Brown is thinking...";
        }
    }
    
    selectedSquare = null;
    drawBoard();
    if (gameActive && currentTurn === 'brown') setTimeout(makeSmartAIMove, 600);
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
                            if (gameState[tr][tc] === '👑') score = 1000;
                            else if (orangeTeam.includes(gameState[tr][tc])) score = 10;
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

window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
drawBoard();
