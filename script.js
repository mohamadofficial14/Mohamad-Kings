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

// --- DANGER ZONE LOGIC ---
// Checks if a square is threatened by any enemy piece
function isSquareUnderAttack(row, col, attackerColor) {
    const enemyTeam = (attackerColor === 'brown') ? brownTeam : orangeTeam;
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (enemyTeam.includes(gameState[r][c])) {
                // Pass 'true' to avoid infinite recursion
                if (isValidMove(r, c, row, col, true)) return true;
            }
        }
    }
    return false;
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

function isValidMove(fR, fC, tR, tC, isCheckSim = false) {
    const piece = gameState[fR][fC];
    const target = gameState[tR][tC];
    const dr = Math.abs(tR - fR), dc = Math.abs(tC - fC);

    if ((currentTurn === 'orange' && orangeTeam.includes(target)) || 
        (currentTurn === 'brown' && brownTeam.includes(target)) || 
        (fR === tR && fC === tC)) return false;

    let possible = false;
    if (piece === '🛡️' || piece === '💂') possible = (dc === 0 && dr === 1);
    else if (piece === '👑' || piece === '🤴') possible = (dr <= 1 && dc <= 1);
    else if (piece === '🏎️' || piece === '🚙') possible = (dr <= 2 && dc <= 2);
    else if (piece === '🕌' || piece === '🕍') possible = ((dr <= 5 && dc === 0) || (dr === 0 && dc <= 5));
    else if (piece === '🐎' || piece === '🦄') possible = (dr <= 1 && dc <= 1);

    // RESTRICT KING FROM STEPPING INTO DANGER
    if (possible && !isCheckSim && (piece === '👑' || piece === '🤴')) {
        const enemyColor = (currentTurn === 'orange') ? 'brown' : 'orange';
        if (isSquareUnderAttack(tR, tC, enemyColor)) return false;
    }

    return possible;
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
           statusDisplay.innerText = `You emptied their Windows Recycle Bin! 🎊 🎉 🙌 `;
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
        
        // This now accounts for the King's restricted movement!
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

// ... (Rest of your UI and Bot Logic functions)
