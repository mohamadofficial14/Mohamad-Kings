let selectedSquare = null;
let currentTurn = 'orange';

// 1. Teams & Emojis
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

    // --- NEW PIECE LOGIC ---

    // 🛡️ SOLDIER CAPTURE & MOVE (Your new logic!)
    if (movingPiece === '🛡️' || movingPiece === '💂') {
        if (rowDiff === 1 && colDiff === 0 && piece !== ' ' && !((movingPiece === '🛡️' && orangeTeam.includes(piece)) || (movingPiece === '💂' && brownTeam.includes(piece)))) {
            alert("Vertical Takedown! 👊");
        } 
        else if (piece === ' ' && rowDiff <= 2 && colDiff === 0) {
            // Normal move allowed
        } 
        else if (piece !== ' ' && (piece === '🐎' || piece === '🦄')) {
            // Allow landing on Horse for mounting
        }
        else {
            alert("Soldiers only move 2 squares or capture 1 square vertically! 🛑");
            selectedSquare = null; drawBoard(gameState); return;
        }
    }

    // 🕌 MINISTER (6 squares vertically straight)
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

    // 🐎 HORSE (Infinite! No limits here)
    // No "if" check needed for horse, he can gallop anywhere!

    // 👑 KING (2 steps max)
    if ((movingPiece === '👑' || movingPiece === '🤴') && (rowDiff > 2 || colDiff > 2)) {
       alert("The King moves 2 steps max! 👑");
       selectedSquare = null; drawBoard(gameState); return;
    }

    // --- CAPTURE & PROMOTION ---

    if (piece === '👑' || piece === '🤴') {
       alert("FALLMATE! موت الملك! 👑🏆");
    }

    if ((movingPiece === '🛡️' || movingPiece === '💂') && (piece === '🐎' || piece === '🦄')) {
       gameState[row][col] = '🏇';
    } 
    else if (movingPiece === '🛡️' && row === 0) {
       alert("Orange Vice President Promoted! 💎🌯");
       gameState[row][col] = '💎';
    } else if (movingPiece === '💂' && row === 9) {
       alert("Brown Vice President Promoted! 💠🌯");
       gameState[row][col] = '💠';
    } else {
       gameState[row][col] = movingPiece;
    }
    
    gameState[fromRow][fromCol] = ' ';
    currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
    document.getElementById('status').innerText = currentTurn === 'orange' ? "Orange's Turn (البرتقالي)" : "Brown's Turn (البني)";
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
