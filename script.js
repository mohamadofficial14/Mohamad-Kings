let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;
let boardHistory = []; // 📝 Tracks snapshots of the board

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
    if (!selectedSquare) return;

    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;
    const movingPiece = gameState[fromRow][fromCol];
    const pieceOnTarget = gameState[row][col];
    const statusDisplay = document.getElementById('status');

    // --- WIN CONDITION CHECK ---
    if (pieceOnTarget === '👑' || pieceOnTarget === '🤴') {
       gameActive = false;
       
       if (currentTurn === 'orange') {
           statusDisplay.innerText = "Fallmate!";
           statusDisplay.style.color = "orange";
       } else {
           statusDisplay.innerText = "Brown Fallmated you!";
           statusDisplay.style.color = "red";
       }
       statusDisplay.style.fontWeight = "bold";
    }

    // Move piece
    gameState[row][col] = movingPiece;
    gameState[fromRow][fromCol] = ' ';
    
    // --- THREEFOLD REPETITION CHECK ---
    // We create a string version of the current board to compare it
    const boardSnapshot = JSON.stringify(gameState);
    boardHistory.push(boardSnapshot);

    if (gameActive && checkThreefoldRepetition()) {
        gameActive = false;
        statusDisplay.innerText = "🤝 Draw by Repetition 🤝";
        statusDisplay.style.color = "gray";
        statusDisplay.style.fontWeight = "bold";
    }

    // Switch Turn (Only if game is still active)
    if (gameActive) {
        currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
        statusDisplay.innerText = currentTurn === 'orange' ? "Orange's Turn" : "Brown is thinking...";
        statusDisplay.style.color = "black";
    }
    
    selectedSquare = null;
    drawBoard(gameState);

    // TRIGGER AI if it's Brown's turn
    if (gameActive && currentTurn === 'brown') {
        setTimeout(makeAIMove, 1000); 
    }
}

// Logic to check if the last state has appeared 3 times consecutively
function checkThreefoldRepetition() {
    if (boardHistory.length < 5) return false; // Need at least 5 moves for a 3-peat sequence
    
    const lastState = boardHistory[boardHistory.length - 1];
    let count = 0;

    // We check the history for the same board setup
    for (let i = boardHistory.length - 1; i >= 0; i--) {
        if (boardHistory[i] === lastState) {
            count++;
        } else {
            // If the sequence is broken, we stop counting (Strictly Consecutive)
            break; 
        }
    }
    return count >= 3;
}

// 🤖 THE BROWN BOT BRAIN
function makeAIMove() {
    let brownPieces = [];
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (brownTeam.includes(gameState[r][c])) {
                brownPieces.push({r, c});
            }
        }
    }

    let moved = false;
    let attempts = 0;
    while (!moved && brownPieces.length > 0 && attempts < 50) {
        let randomIndex = Math.floor(Math.random() * brownPieces.length);
        let p = brownPieces[randomIndex];
        let targetRow = p.r + 1; 
        
        // Simple Bot Logic: Move forward if possible
        if (targetRow < 10) {
            selectedSquare = { row: p.r, col: p.c };
            executeMove(targetRow, p.c);
            moved = true;
        } else {
            brownPieces.splice(randomIndex, 1);
        }
        attempts++;
    }
}

// Initial Game Setup
let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

drawBoard(gameState);
