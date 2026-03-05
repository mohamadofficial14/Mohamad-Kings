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

    // 1. Cannot capture own piece
    if (currentTurn === 'orange' && orangeTeam.includes(target)) return false;
    if (currentTurn === 'brown' && brownTeam.includes(target)) return false;
    if (fR === tR && fC === tC) return false;

    // 2. Movement Logic
    // Soldier: 1 square vertically
    if (piece === '🛡️' || piece === '💂') {
        return dc === 0 && dr === 1;
    }
    // King & Car: 2 squares any direction
    if (piece === '👑' || piece === '🤴' || piece === '🏎️' || piece === '🚙') {
        return (dr <= 2 && dc <= 2);
    }
    // Minister: 5 squares H or V
    if (piece === '🕌' || piece === '🕍') {
        return ((dr <= 5 && dc === 0) || (dr === 0 && dc <= 5));
    }
    // Horse & Unicorn: 1 square any direction
    if (piece === '🐎' || piece === '🦄') {
        return (dr <= 1 && dc <= 1);
    }
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
       statusDisplay.innerText = currentTurn === 'orange' ? "Fallmate! Orange Wins!" : "Brown Fallmated you!";
       statusDisplay.style.color = currentTurn === 'orange' ? "orange" : "red";
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
        setTimeout(makeSmartAIMove, 600); 
    }
}

function makeSmartAIMove() {
    let possibleMoves = [];
    
    // Find all possible legal moves for Brown
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (brownTeam.includes(gameState[r][c])) {
                for (let tr = 0; tr < 10; tr++) {
                    for (let tc = 0; tc < 10; tc++) {
                        if (isValidMove(r, c, tr, tc)) {
                            let score = 0;
                            const targetPiece = gameState[tr][tc];
                            // Scoring: Prioritize capturing King, then other pieces
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
        // Sort by score (best moves first)
        possibleMoves.sort((a, b) => b.score - a.score);
        // Take the best move, or a random one of the top moves
        const bestMove = possibleMoves[0];
        selectedSquare = { row: bestMove.fR, col: bestMove.fC };
        executeMove(bestMove.tR, bestMove.tC);
    }
}

drawBoard();
