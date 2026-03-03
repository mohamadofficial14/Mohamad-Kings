let selectedSquare = null;
let currentTurn = 'orange'; // Orange starts the invasion! 👑

// 1. UNIQUE PIECES FOR BOTH SIDES
const orangeTeam = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'];
const brownTeam  = ['🤴', '💂', '🏰', '🚙', '🦄', '🏇', '💠']; 

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
  
  // SELECT PIECE
  if (!selectedSquare) {
    if (piece === ' ') return;
    
    // Check if it's the correct turn and correct team piece
    if (currentTurn === 'orange' && !orangeTeam.includes(piece)) return;
    if (currentTurn === 'brown' && !brownTeam.includes(piece)) return;

    selectedSquare = { row, col };
    drawBoard(gameState);
  } 
  // MOVE PIECE
  else {
    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;
    const movingPiece = gameState[fromRow][fromCol];

    // THE ANTI-TELEPORT RULE (Soldiers can only move 2 steps max)
    const dist = Math.abs(row - fromRow);
    if ((movingPiece === '🛡️' || movingPiece === '💂') && dist > 2) {
       alert("Soldiers can't teleport! They need a Horse for that! 🛑");
       selectedSquare = null;
       drawBoard(gameState);
       return;
    }

    // FALLMATE LOGIC (Check if landing on a King)
    if (piece === '👑' || piece === '🤴') {
       alert("FALLMATE! موت الملك! Mohamad Kings Victory! 👑🏆");
    }

    // HORSE MOUNTING 🐎
    if ((movingPiece === '🛡️' || movingPiece === '💂') && (piece === '🐎' || piece === '🦄')) {
       gameState[row][col] = '🏇';
    } 
    // VICE PRESIDENT PROMOTION (Shawarma Time! 🌯)
    else if (movingPiece === '🛡️' && row === 0) {
       alert("He ate too many Shawarmas! 🌯 He's the Vice President now! 💎");
       gameState[row][col] = '💎';
    }
    else {
       gameState[row][col] = movingPiece;
    }
    
    gameState[fromRow][fromCol] = ' ';

    // SWITCH TURNS
    currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
    document.getElementById('status').innerText = 
      currentTurn === 'orange' ? "Orange's Turn (البرتقالي)" : "Brown's Turn (البني)";

    selectedSquare = null;
    drawBoard(gameState);
  }
}

// 10x10 Game Start (Orange bottom, Brown top)
let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
// Brown Team
gameState[0] = ['🚙', ' ', ' ', '🏰', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
// Orange Team
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

drawBoard(gameState);
