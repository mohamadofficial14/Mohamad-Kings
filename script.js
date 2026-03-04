// --- 1. DATA & PIECE VALUES ---
const pieceValues = {
  '👑': 1000, '🤴': -1000, '🕌': 10, '🕍': -10,
  '🏇': 7, '💎': 7, '💠': -7, '🏎️': 5, '🚙': -5,
  '🐎': 3, '🦄': -3, '🛡️': 1, '💂': -1
};

// --- 2. MOVE VALIDATION (The AI's "Eyes") ---
function isValidMove(board, fromRow, fromCol, toRow, toCol, team) {
  const piece = board[fromRow][fromCol];
  const target = board[toRow][toCol];
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // Don't capture your own team
  if (team === 'orange' && orangeTeam.includes(target)) return false;
  if (team === 'brown' && brownTeam.includes(target)) return false;

  // Soldier Logic
  if (piece === '🛡️' || piece === '💂') {
    if (rowDiff === 1 && colDiff === 0 && target !== ' ') return true; // Capture
    if (target === ' ' && rowDiff <= 2 && colDiff === 0) return true;  // Move
    if (target === '🐎' || target === '🦄') return true;               // Promotion step
    return false;
  }
  // Minister (6 vertical)
  if (piece === '🕌' || piece === '🕍') return colDiff === 0 && rowDiff <= 6;
  // Car (5 squares)
  if (piece === '🏎️' || piece === '🚙') return rowDiff <= 5 && colDiff <= 5;
  // King (2 squares)
  if (piece === '👑' || piece === '🤴') return rowDiff <= 2 && colDiff <= 2;
  // Horse/Unicorn (1 square)
  if (piece === '🐎' || piece === '🦄') return rowDiff <= 1 && colDiff <= 1;

  return true; 
}

// --- 3. THE AI "BRAIN" (Minimax) ---
function minimax(board, depth, isMaximizing) {
  if (depth === 0) return evaluateBoard(board);

  let bestEval = isMaximizing ? -Infinity : Infinity;
  const moves = getAllPossibleMoves(board, isMaximizing ? 'orange' : 'brown');

  for (const move of moves) {
    const tempBoard = JSON.parse(JSON.stringify(board)); // Clone board
    executeMove(tempBoard, move);
    const eval = minimax(tempBoard, depth - 1, !isMaximizing);
    bestEval = isMaximizing ? Math.max(bestEval, eval) : Math.min(bestEval, eval);
  }
  return bestEval;
}

// --- 4. EXECUTING THE AI TURN ---
function makeAIMove() {
  let bestMove = null;
  let bestValue = Infinity; // Brown AI wants the lowest (negative) score
  const moves = getAllPossibleMoves(gameState, 'brown');

  moves.forEach(move => {
    const tempBoard = JSON.parse(JSON.stringify(gameState));
    executeMove(tempBoard, move);
    const boardValue = minimax(tempBoard, 2, true); // Search 2 moves ahead
    if (boardValue < bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  });

  if (bestMove) {
    // Actually apply the move to the real game
    executeMove(gameState, bestMove);
    currentTurn = 'orange';
    drawBoard(gameState);
    checkGameOver();
  }
}

// --- 5. UPDATED GAME LOOP ---
function handleSquareClick(row, col) {
  if (!gameActive || currentTurn === 'brown') return; // Disable clicks during AI turn

  // ... [Your existing movement logic for the Orange Player goes here] ...

  if (gameActive && currentTurn === 'brown') {
    document.getElementById('status').innerText = "AI is thinking... 🤖";
    setTimeout(makeAIMove, 600); // Give the user a moment to see the board
  }
}
