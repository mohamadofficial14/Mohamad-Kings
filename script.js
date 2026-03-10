let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;
let moveHistory = [];

const orangeTeam = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'];
const brownTeam  = ['🤴', '💂', '🕍', '🚙', '🦄', '🏇', '💠'];

let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

// --- NEW LOGIC: CHECK DETECTION ---
function isSquareUnderAttack(tR, tC, attackerColor) {
    const attackers = (attackerColor === 'orange') ? orangeTeam : brownTeam;
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (attackers.includes(gameState[r][c])) {
                if (canPieceAttack(r, c, tR, tC)) return true;
            }
        }
    }
    return false;
}

function canPieceAttack(fR, fC, tR, tC) {
    const piece = gameState[fR][fC];
    const dr = Math.abs(tR - fR);
    const dc = Math.abs(tC - fC);
    if (piece === '🛡️' || piece === '💂') return dc === 0 && dr === 1;
    if (piece === '👑' || piece === '🤴') return (dr <= 1 && dc <= 1);
    if (piece === '🏎️' || piece === '🚙') return (dr <= 2 && dc <= 2);
    if (piece === '🕌' || piece === '🕍') return ((dr <= 5 && dc === 0) || (dr === 0 && dc <= 5));
    if (piece === '🐎' || piece === '🦄') return (dr <= 1 && dc <= 1);
    return false;
}

function isCheckmate(color) {
    const kingPiece = (color === 'orange') ? '👑' : '🤴';
    let kR, kC;
    gameState.forEach((row, r) => row.forEach((p, c) => { if (p === kingPiece) { kR = r; kC = c; } }));
    
    // Check if any legal move removes the check
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if ((color === 'orange' ? orangeTeam : brownTeam).includes(gameState[r][c])) {
                for (let tr = 0; tr < 10; tr++) {
                    for (let tc = 0; tc < 10; tc++) {
                        if (isValidMove(r, c, tr, tc)) {
                            // Virtual move to see if still in check
                            const temp = gameState[tr][tc];
                            gameState[tr][tc] = gameState[r][c];
                            gameState[r][c] = ' ';
                            const stillInCheck = isSquareUnderAttack(kR, kC, color === 'orange' ? 'brown' : 'orange');
                            gameState[r][c] = gameState[tr][tc]; // Undo
                            gameState[tr][tc] = temp;
                            if (!stillInCheck) return false;
                        }
                    }
                }
            }
        }
    }
    return true;
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
            // Verify move doesn't leave own king in check
            const temp = gameState[row][col];
            gameState[row][col] = gameState[selectedSquare.row][selectedSquare.col];
            gameState[selectedSquare.row][selectedSquare.col] = ' ';
            
            const myColor = currentTurn;
            const king = myColor === 'orange' ? '👑' : '🤴';
            let kR, kC;
            gameState.forEach((r, i) => r.forEach((p, j) => { if (p === king) { kR = i; kC = j; } }));
            
            if (isSquareUnderAttack(kR, kC, myColor === 'orange' ? 'brown' : 'orange')) {
                gameState[selectedSquare.row][selectedSquare.col] = gameState[row][col];
                gameState[row][col] = temp;
                selectedSquare = null;
                drawBoard();
                return;
            }
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
    if ((currentTurn === 'orange' && orangeTeam.includes(target)) || (currentTurn === 'brown' && brownTeam.includes(target))) return false;
    if (fR === tR && fC === tC) return false;
    if (piece === '🛡️' || piece === '💂') return dc === 0 && dr === 1;
    if (piece === '👑' || piece === '🤴') return (dr <= 1 && dc <= 1);
    if (piece === '🏎️' || piece === '🚙') return (dr <= 2 && dc <= 2);
    if (piece === '🕌' || piece === '🕍') return ((dr <= 5 && dc === 0) || (dr === 0 && dc <= 5));
    if (piece === '🐎' || piece === '🦄') return (dr <= 1 && dc <= 1);
    return false;
}

function executeMove(row, col) {
    gameState[row][col] = gameState[selectedSquare.row][selectedSquare.col];
    gameState[selectedSquare.row][selectedSquare.col] = ' ';
    selectedSquare = null;
    
    const opponent = currentTurn === 'orange' ? 'brown' : 'orange';
    const king = opponent === 'orange' ? '👑' : '🤴';
    let kR, kC;
    gameState.forEach((r, i) => r.forEach((p, j) => { if (p === king) { kR = i; kC = j; } }));

    if (isSquareUnderAttack(kR, kC, currentTurn)) {
        if (isCheckmate(opponent)) {
            gameActive = false;
            document.getElementById('status').innerText = currentTurn === 'orange' ? "Checkmate!" : "Brown checkmated you!";
            document.getElementById('status').style.color = currentTurn === 'orange' ? "lime" : "red";
        } else {
            document.getElementById('status').innerText = `${opponent.charAt(0).toUpperCase() + opponent.slice(1)} is in check!`;
        }
    } else {
        currentTurn = opponent;
        document.getElementById('status').innerText = `${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}'s Turn`;
    }
    
    drawBoard();
    if (gameActive && currentTurn === 'brown') setTimeout(makeSmartAIMove, 600);
}

// ... Keep existing drawBoard, botSpeak, and makeSmartAIMove functions ...
