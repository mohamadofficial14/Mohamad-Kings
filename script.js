// --- GAME STATE & CONFIG ---
let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;
let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));

// Initial setup
gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

const orangeTeam = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'];
const brownTeam  = ['🤴', '💂', '🕍', '🚙', '🦄', '🏇', '💠'];

// --- CORE FUNCTIONS ---
function drawBoard() {
    const boardElement = document.getElementById('game-board');
    if (!boardElement) return; // Safety check
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

function isValidMove(fR, fC, tR, tC) {
    const piece = gameState[fR][fC];
    const target = gameState[tR][tC];
    const dr = Math.abs(tR - fR);
    const dc = Math.abs(tC - fC);

    if ((currentTurn === 'orange' && orangeTeam.includes(target)) || 
        (currentTurn === 'brown' && brownTeam.includes(target))) return false;
    
    if (fR === tR && fC === tC) return false;

    // Movement Rules
    if (piece === '🛡️' || piece === '💂') return dc === 0 && dr === 1;
    if (piece === '👑' || piece === '🤴') return (dr <= 1 && dc <= 1); // Restricted to 1 square!
    if (piece === '🏎️' || piece === '🚙') return (dr <= 2 && dc <= 2);
    if (piece === '🕌' || piece === '🕍') return ((dr <= 5 && dc === 0) || (dr === 0 && dc <= 5));
    if (piece === '🐎' || piece === '🦄') return (dr <= 1 && dc <= 1);
    
    return false;
}

// ... (Add the helper functions: isSquareUnderAttack, isCheckmate, handleSquareClick, executeMove, makeSmartAIMove here)

// Final Init
drawBoard();
