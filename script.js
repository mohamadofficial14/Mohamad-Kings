// --- GAME STATE ---
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

// --- CORE LOGIC: ATTACK & CHECK ---

function isSquareUnderAttack(row, col, attackerColor) {
    const enemyTeam = (attackerColor === 'brown') ? brownTeam : orangeTeam;
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (enemyTeam.includes(gameState[r][c])) {
                // Use isValidMove with a flag to prevent infinite loops
                if (checkBaseMovement(r, c, row, col)) return true;
            }
        }
    }
    return false;
}

function isKingInCheck(playerColor) {
    let kR, kC;
    const kingEmoji = (playerColor === 'orange') ? '👑' : '🤴';
    const enemyColor = (playerColor === 'orange') ? 'brown' : 'orange';

    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (gameState[r][c] === kingEmoji) {
                kR = r; kC = c; break;
            }
        }
    }
    return isSquareUnderAttack(kR, kC, enemyColor);
}

// Separate base movement from the "Check" restriction to avoid loops
function checkBaseMovement(fR, fC, tR, tC) {
    const piece = gameState[fR][fC];
    const target = gameState[tR][tC];
    const dr = Math.abs(tR - fR), dc = Math.abs(tC - fC);

    // Can't capture your own team or stay in place
    if (fR === tR && fC === tC) return false;
    if (currentTurn === 'orange' && orangeTeam.includes(target)) return false;
    if (currentTurn === 'brown' && brownTeam.includes(target)) return false;

    if (piece === '🛡️' || piece === '💂') return dc === 0 && dr === 1;
    if (piece === '👑' || piece === '🤴') return (dr <= 1 && dc <= 1);
    if (piece === '🏎️' || piece === '🚙') return (dr <= 2 && dc <= 2);
    if (piece === '🕌' || piece === '🕍') return ((dr <= 5 && dc === 0) || (dr === 0 && dc <= 5));
    if (piece === '🐎' || piece === '🦄') return (dr <= 1 && dc <= 1);
    return false;
}

function isValidMove(fR, fC, tR, tC) {
    if (!checkBaseMovement(fR, fC, tR, tC)) return false;

    // Simulation: Would this move put/keep our king in check?
    const originalTarget = gameState[tR][tC];
    const originalSource = gameState[fR][fC];
    
    gameState[tR][tC] = originalSource;
    gameState[fR][fC] = ' ';
    
    const badMove = isKingInCheck(currentTurn);

    // Undo simulation
    gameState[fR][fC] = originalSource;
    gameState[tR][tC] = originalTarget;

    return !badMove;
}

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

// --- GAME EXECUTION ---

function executeMove(row, col) {
    const fromRow = selectedSquare.row, fromCol = selectedSquare.col;
    const movingPiece = gameState[fromRow][fromCol];
    const statusDisplay = document.getElementById('status');

    gameState[row][col] = movingPiece;
    gameState[fromRow][fromCol] = ' ';
    
    // Switch Turn
    currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
    
    const inCheck = isKingInCheck(currentTurn);
    const hasMoves = canPlayerMove(currentTurn);

    if (!hasMoves) {
        if (inCheck) {
            endGame(currentTurn === 'brown' ? "Checkmate! Orange Wins! 🎊" : "Checkmate! Brown Wins! 💂", "lime");
        } else {
            endGame("Stalemate! No legal moves left.", "cyan");
        }
    } else {
        statusDisplay.innerText = inCheck ? "CHECK! ⚠️" : (currentTurn === 'orange' ? "Orange's Turn" : "Brown is thinking...");
        if (inCheck) statusDisplay.style.color = "orange";
        else statusDisplay.style.color = "white";
    }

    selectedSquare = null;
    drawBoard();
    if (gameActive && currentTurn === 'brown') setTimeout(makeSmartAIMove, 600);
}

// --- BOT & UTILITY ---

function makeSmartAIMove() {
    let possibleMoves = [];
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (brownTeam.includes(gameState[r][c])) {
                for (let tr = 0; tr < 10; tr++) {
                    for (let tc = 0; tc < 10; tc++) {
                        if (isValidMove(r, c, tr, tc)) {
                            let score = (orangeTeam.includes(gameState[tr][tc])) ? 10 : 0;
                            possibleMoves.push({fR: r, fC: c, tR: tr, tC: tc, score: score});
                        }
                    }
                }
            }
        }
    }
    if (possibleMoves.length > 0) {
        possibleMoves.sort((a, b) => b.score - a.score);
        const chosen = possibleMoves[0]; // Take the best or random among best
        selectedSquare = { row: chosen.fR, col: chosen.fC };
        executeMove(chosen.tR, chosen.tC);
    }
}

function endGame(msg, color) {
    gameActive = false;
    const statusDisplay = document.getElementById('status');
    statusDisplay.innerText = msg;
    statusDisplay.style.color = color;
    botSpeak(msg);
}

function botSpeak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'en-GB';
    speech.pitch = 0.8;
    window.speechSynthesis.speak(speech);
}

function drawBoard() {
    const boardElement = document.getElementById('game-board');
    if (!boardElement) return;
    boardElement.innerHTML = '';
    gameState.forEach((row, r) => {
        row.forEach((piece, c) => {
            const square = document.createElement('div');
            square.className = `square ${(r + c) % 2 === 0 ? 'orange-sq' : 'brown-sq'}`;
            square.innerText = piece;
            if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) {
                square.style.border = "2px solid yellow";
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

// Launch
drawBoard();
