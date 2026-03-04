let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;
let boardHistory = {}; // 📖 Stores snapshots of the board

const orangeTeam = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'];
const brownTeam  = ['🤴', '💂', '🕍', '🚙', '🦄', '🏇', '💠'];

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
    
    // 🛡️ SOLDIER CAPTURE & MOVE
    if (movingPiece === '🛡️' || movingPiece === '💂') {
        if (rowDiff === 1 && colDiff === 0 && piece !== ' ' && !((movingPiece === '🛡️' && orangeTeam.includes(piece)) || (movingPiece === '💂' && brownTeam.includes(piece)))) {
            // Valid capture
        } 
        else if (piece === ' ' && rowDiff <= 2 && colDiff === 0) { } 
        else if (piece !== ' ' && (piece === '🐎' || piece === '🦄')) { }
        else {
            alert("Soldiers only move 2 squares or capture 1 square vertically! 🛑");
            selectedSquare = null; drawBoard(gameState); return;
        }
    }

    // 🕌 MINISTER (6 squares vertical)
    if (movingPiece === '🕌' || movingPiece === '🕍') {
        if (colDiff !== 0 || rowDiff > 6) {
            alert("The Minister is limited to 6 squares vertically! 🕌");
            selectedSquare = null; drawBoard(gameState); return;
        }
    }

    // 🏎️ CAR (5 squares)
    if ((movingPiece === '🏎️' || movingPiece === '🚙') && (rowDiff > 5 || colDiff > 5)) {
       alert("Traffic Jam! Cars can only travel 5 squares! 🏎️💨");
       selectedSquare = null; drawBoard(gameState); return;
    }

    // 👑 KING (2 steps max)
    if ((movingPiece === '👑' || movingPiece === '🤴') && (rowDiff > 2 || colDiff > 2)) {
       alert("The King moves 2 steps max! 👑");
       selectedSquare = null; drawBoard(gameState); return;
    }

    // 🐎 HORSE & 🦄 UNICORN (1 square limit)
    if (movingPiece === '🐎' || movingPiece === '🦄') {
       if (rowDiff > 1 || colDiff > 1) {
          alert("The Horse and Unicorn are tired! They can only move 1 square. 🐎💤");
          selectedSquare = null; drawBoard(gameState); return;
       }
    }

    // --- LOGIC: FALLMATE & PROMOTION ---

    if (piece === '👑' || piece === '🤴') {
       gameActive = false;
       document.getElementById('status').innerText = "🏆 GAME OVER - FALLMATE! 🏆";
       alert("FALLMATE! موت الملك! 👑🏆");
    }

    // Promotion logic
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

    // --- UPDATED: TWOFOLD REPETITION CHECK ---
    const boardSnapshot = JSON.stringify(gameState);
    boardHistory[boardSnapshot] = (boardHistory[boardSnapshot] || 0) + 1;

    if (boardHistory[boardSnapshot] >= 2) {
       gameActive = false;
       document.getElementById('status').innerText = "🤝 DRAW - TWOFOLD REPETITION! 🤝";
       document.getElementById('status').style.color = "gray";
       alert("Stalemate by Repetition 🕺💃🛑🤝");
    }
    
    if (gameActive) {
        currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
        document.getElementById('status').innerText = currentTurn === 'orange' ? "Orange's Turn (البرتقالي)" : "Brown's Turn (البني)";
    }

    selectedSquare = null;
    drawBoard(gameState);
  }
}

let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

drawBoard(gameState);
