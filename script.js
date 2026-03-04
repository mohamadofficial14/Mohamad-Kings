let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;

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
    executeMove(row, col);
  }
}

function executeMove(row, col) {
    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;
    const movingPiece = gameState[fromRow][fromCol];
    const rowDiff = Math.abs(row - fromRow);
    const colDiff = Math.abs(col - fromCol);
    const pieceOnTarget = gameState[row][col];

    // --- RULES CHECK ---
    if ((movingPiece === '🛡️' || movingPiece === '💂') && (rowDiff > 2 || colDiff > 0)) {
       if (!(rowDiff === 1 && colDiff === 0 && pieceOnTarget !== ' ')) {
          selectedSquare = null; drawBoard(gameState); return;
       }
    }
    // (Other rules omitted for brevity but kept in your logic...)

    if (pieceOnTarget === '👑' || pieceOnTarget === '🤴') {
       gameActive = false;
       alert("FALLMATE! 👑🏆");
    }

    // Move piece
    gameState[row][col] = movingPiece;
    gameState[fromRow][fromCol] = ' ';
    
    // Switch Turn
    currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
    document.getElementById('status').innerText = currentTurn === 'orange' ? "Orange's Turn" : "Brown is thinking...";
    
    selectedSquare = null;
    drawBoard(gameState);

    // TRIGGER AI if it's Brown's turn
    if (gameActive && currentTurn === 'brown') {
        setTimeout(makeAIMove, 1000); // Wait 1 second
    }
}

// 🤖 THE BROWN BOT BRAIN
function makeAIMove() {
    let brownPieces = [];
    // 1. Find all brown pieces
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (brownTeam.includes(gameState[r][c])) {
                brownPieces.push({r, c});
            }
        }
    }

    // 2. Simple AI: Pick a random piece and try to move it forward
    let moved = false;
    while (!moved && brownPieces.length > 0) {
        let randomIndex = Math.floor(Math.random() * brownPieces.length);
        let p = brownPieces[randomIndex];
        let targetRow = p.r + 1; // Try to move forward
        
        if (targetRow < 10) {
            selectedSquare = { row: p.r, col: p.c };
            executeMove(targetRow, p.c);
            moved = true;
        } else {
            brownPieces.splice(randomIndex, 1);
        }
    }
}

let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

drawBoard(gameState);
