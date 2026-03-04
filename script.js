let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;
let boardHistory = {}; 

const orangeTeam = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'];
const brownTeam  = ['🤴', '💂', '🕍', '🚙', '🦄', '🏇', '💠'];

let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));

// Initial Setup
function initGame() {
    gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
    gameState[1] = Array(10).fill('💂');
    gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
    gameState[8] = Array(10).fill('🛡️');
    drawBoard(gameState);
}

function drawBoard(currentBoardState) {
  const boardElement = document.getElementById('game-board');
  boardElement.innerHTML = '';
  currentBoardState.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      const square = document.createElement('div');
      square.className = `square ${(rowIndex + colIndex) % 2 === 0 ? 'orange-sq' : 'brown-sq'}`;
      square.innerText = piece || '';
      
      if (selectedSquare && selectedSquare.row === rowIndex && selectedSquare.col === colIndex) {
        square.style.backgroundColor = "yellow"; 
      }
      
      square.onclick = () => handleSquareClick(rowIndex, colIndex);
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
    drawBoard(gameState);
  } else {
    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;
    const movingPiece = gameState[fromRow][fromCol];
    const rowDiff = Math.abs(row - fromRow);
    const colDiff = Math.abs(col - fromCol);

    // --- MOVEMENT RULES ---
    if (movingPiece === '🛡️' || movingPiece === '💂') {
        if (!( (rowDiff === 1 && colDiff === 0 && piece !== ' ') || (piece === ' ' && rowDiff <= 2 && colDiff === 0) )) {
            return resetSelection("Soldiers move 2 or capture 1 vertically! 🛑");
        }
    }
    if ((movingPiece === '🕌' || movingPiece === '🕍') && (colDiff !== 0 || rowDiff > 6)) {
        return resetSelection("Minister is limited to 6 squares vertically! 🕌");
    }
    if ((movingPiece === '🏎️' || movingPiece === '🚙') && (rowDiff > 5 || colDiff > 5)) {
       return resetSelection("Traffic Jam! Max 5 squares! 🏎️💨");
    }
    if ((movingPiece === '👑' || movingPiece === '🤴') && (rowDiff > 2 || colDiff > 2)) {
       return resetSelection("The King moves 2 steps max! 👑");
    }
    if ((movingPiece === '🐎' || movingPiece === '🦄') && (rowDiff > 1 || colDiff > 1)) {
       return resetSelection("The Horse is tired! Max 1 square. 🐎💤");
    }

    // --- EXECUTE MOVE ---
    if (piece === '👑' || piece === '🤴') {
       triggerGameOver("👑 FALLMATE! الملك سقط! 👑");
    }

    // Promotion / Cavalry Logic
    if ((movingPiece === '🛡️' || movingPiece === '💂') && (piece === '🐎' || piece === '🦄')) {
       gameState[row][col] = '🏇';
    } else if (movingPiece === '🛡️' && row === 0) {
       gameState[row][col] = '💎';
    } else if (movingPiece === '💂' && row === 9) {
       gameState[row][col] = '💠';
    } else {
       gameState[row][col] = movingPiece;
    }
    gameState[fromRow][fromCol] = ' ';

    // --- REPETITION CHECK ---
    const boardSnapshot = JSON.stringify(gameState);
    boardHistory[boardSnapshot] = (boardHistory[boardSnapshot] || 0) + 1;
    if (boardHistory[boardSnapshot] >= 3) {
       triggerGameOver("🤝 DRAW: THREEFOLD REPETITION! 🤝", true);
    }
    
    if (gameActive) {
        currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
        document.getElementById('status').innerText = currentTurn === 'orange' ? "Orange's Turn (البرتقالي)" : "Brown's Turn (البني)";
    }

    selectedSquare = null;
    drawBoard(gameState);
  }
}

function resetSelection(msg) {
    alert(msg);
    selectedSquare = null;
    drawBoard(gameState);
}

function triggerGameOver(message, isDraw = false) {
    gameActive = false;
    const noticeBox = document.getElementById('notice');
    noticeBox.innerText = message;
    noticeBox.style.color = isDraw ? "gray" : "#FFD700";
    document.getElementById('status').innerText = "🏆 GAME OVER 🏆";
}

initGame();
