let selectedSquare = null;
let currentTurn = 'orange'; // Orange starts! 👑

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
  
  // 1. SELECT PIECE
  if (!selectedSquare) {
    if (piece === ' ') return;
    
    // Turn Enforcement
    const isOrangePiece = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'].includes(piece); 
    if (currentTurn === 'orange' && !isOrangePiece) return;
    if (currentTurn === 'brown' && isOrangePiece) return;

    selectedSquare = { row, col };
    drawBoard(gameState);
  } 
  // 2. MOVE PIECE
  else {
    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;
    const movingPiece = gameState[fromRow][fromCol];

    // Fallmate Logic!
    if (gameState[row][col] === '👑') {
       alert("FALLMATE! موت الملك! Mohamad Kings Victory! 👑🏆");
    }

    // Mounting Logic
    if (movingPiece === '🛡️' && gameState[row][col] === '🐎') {
       gameState[row][col] = '🏇';
    } else {
       gameState[row][col] = movingPiece;
    }
    
    gameState[fromRow][fromCol] = ' ';

    // 3. SWITCH TURNS
    currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
    const statusText = currentTurn === 'orange' ? "Orange's Turn (البرتقالي)" : "Brown's Turn (البني)";
    document.getElementById('status').innerText = statusText;

    selectedSquare = null;
    drawBoard(gameState);
  }
}

// 10x10 Game Start
let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');
gameState[0] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[1] = Array(10).fill('🛡️');

drawBoard(gameState);
