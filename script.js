let selectedSquare = null;

// This function clears the board and redraws it every time a move happens
function drawBoard(currentBoardState) {
  const boardElement = document.getElementById('game-board');
  boardElement.innerHTML = ''; // Clear board

  currentBoardState.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      const square = document.createElement('div');
      square.className = `square ${(rowIndex + colIndex) % 2 === 0 ? 'orange-sq' : 'brown-sq'}`;
      square.innerText = piece || '';
      
      // Add 'selected' visual if clicked
      if (selectedSquare && selectedSquare.row === rowIndex && selectedSquare.col === colIndex) {
        square.style.backgroundColor = "yellow"; 
      }

      square.onclick = () => handleSquareClick(rowIndex, colIndex);
      boardElement.appendChild(square);
    });
  });
}

// THE RULES: Handle clicking squares
function handleSquareClick(row, col) {
  const piece = gameState[row][col];

  if (selectedSquare) {
    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;
    const movingPiece = gameState[fromRow][fromCol];

    // 1. THE HORSE MOUNTING LOGIC 🐎
    if (movingPiece === '🛡️' && gameState[row][col] === '🐎') {
       gameState[row][col] = '🏇'; // Soldier mounts!
       gameState[fromRow][fromCol] = ' ';
    } 
    // 2. BASIC MOVEMENT
    else {
       gameState[row][col] = movingPiece;
       gameState[fromRow][fromCol] = ' ';
    }

    selectedSquare = null;
    drawBoard(gameState);
  } else {
    if (piece !== ' ') {
      selectedSquare = { row, col };
      drawBoard(gameState);
    }
  }
}

// Initialize the 10x10 Game State
let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));

// Setup Starting Positions
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');
gameState[0] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[1] = Array(10).fill('🛡️');

drawBoard(gameState);
