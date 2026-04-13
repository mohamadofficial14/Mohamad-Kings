let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;
let moveHistory = [];

const orangeTeam = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'];
const brownTeam = ['🤴', '💂', '🕍', '🚙', '🦄', '🏇', '💠'];

// إعداد اللعبة
let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

function getRandomELO() { return Math.floor(Math.random() * 11) + 5; }

function botSpeak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'en-GB';
    window.speechSynthesis.speak(speech);
}

document.getElementById('resign-btn').onclick = () => {
    if (!gameActive) return;
    gameActive = false;
    document.getElementById('status').innerText = "Brown won by resignation.";
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

// دالة جديدة للتحقق من سلامة المربع للملك
function isSquareSafe(row, col, team) {
    const opponentTeam = team === 'orange' ? brownTeam : orangeTeam;
    const opponentPawn = team === 'orange' ? '💂' : '🛡️';
    const opponentKing = team === 'orange' ? '🤴' : '👑';
    const opponentHorse = team === 'orange' ? '🦄' : '🐎';

    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            const piece = gameState[r][c];
            if (!opponentTeam.includes(piece)) continue;

            const dr = Math.abs(r - row);
            const dc = Math.abs(c - col);

            // خطر الجندي (أمام أو خلف)
            if (piece === opponentPawn && dc === 0 && dr === 1) return false;
            // خطر الحصان أو الملك (أي مربع مجاور)
            if ((piece === opponentHorse || piece === opponentKing) && dr <= 1 && dc <= 1) return false;
        }
    }
    return true;
}

function checkDrawCondition() {
    let piecesCount = 0;
    gameState.forEach(row => row.forEach(p => { if (p !== ' ') piecesCount++; }));
    
    if (piecesCount === 2) {
        gameActive = false;
        const status = document.getElementById('status');
        status.innerText = "Draw! We can't checkmate with these measly pieces. 🤝";
        status.style.color = "gray";
        return true;
    }
    return false;
}

function isValidMove(fR, fC, tR, tC) {
    const piece = gameState[fR][fC];
    const target = gameState[tR][tC];
    const dr = Math.abs(tR - fR);
    const dc = Math.abs(tC - fC);

    if ((currentTurn === 'orange' && orangeTeam.includes(target)) ||
        (currentTurn === 'brown' && brownTeam.includes(target))) return false;

    // الملوك تتحرك مربع واحد فقط + حماية الملك
    if (piece === '👑' || piece === '🤴') {
        if (dr > 1 || dc > 1) return false;
        if (!isSquareSafe(tR, tc, currentTurn)) return false;
        return true;
    }

    if (piece === '🛡️' || piece === '💂') return dc === 0 && dr === 1;
    if (piece === '🏎️' || piece === '🚙') return (dr <= 2 && dc <= 2);
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
        const elo = getRandomELO();
        if (currentTurn === 'brown') {
            statusDisplay.innerText = `Brown fallmated you! -${elo} ELO.`;
            botSpeak("Dear Diary, today I won another match.");
        } else {
            statusDisplay.innerText = `Fallmate. Orange Wins! +${elo} ELO.`;
        }
    }

    gameState[row][col] = movingPiece;
    gameState[fromRow][fromCol] = ' ';

    if (gameActive && checkDrawCondition()) return drawBoard();

    if (gameActive) {
        currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
        statusDisplay.innerText = currentTurn === 'orange' ? "Orange's Turn" : "Brown is thinking...";
        if (currentTurn === 'brown') setTimeout(makeSmartAIMove, 600);
    }
    selectedSquare = null;
    drawBoard();
}

function makeSmartAIMove() {
    let possibleMoves = [];
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (brownTeam.includes(gameState[r][c])) {
                for (let tr = 0; tr < 10; tr++) {
                    for (let tc = 0; tc < 10; tc++) {
                        if (isValidMove(r, c, tr, tc)) {
                            let score = (gameState[tr][tc] === '👑') ? 1000 : 0;
                            possibleMoves.push({fR: r, fC: c, tR: tr, tC: tc, score});
                        }
                    }
                }
            }
        }
    }
    if (possibleMoves.length > 0) {
        const bestMove = possibleMoves.sort((a, b) => b.score - a.score)[0];
        selectedSquare = { row: bestMove.fR, col: bestMove.fC };
        executeMove(bestMove.tR, bestMove.tC);
    }
}

function handleSquareClick(row, col) {
    if (!gameActive) return;
    const piece = gameState[row][col];
    if (!selectedSquare) {
        if (piece === ' ' || (currentTurn === 'orange' && !orangeTeam.includes(piece)) || (currentTurn === 'brown' && !brownTeam.includes(piece))) return;
        selectedSquare = { row, col };
        drawBoard();
    } else {
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) executeMove(row, col);
        else { selectedSquare = null; drawBoard(); }
    }
}

drawBoard();
