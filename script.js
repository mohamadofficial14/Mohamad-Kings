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

    // 1. 🛡️ SOLDIER MOVEMENT (Max 2 squares forward)
    if ((movingPiece === '🛡️' || movingPiece === '💂') && (rowDiff > 2 || colDiff > 0)) {
       alert("Soldiers only move straight and only up to 2 squares! 🛑");
       selectedSquare = null; drawBoard(gameState); return;
    }

    // 2. 🏎️ CAR MOVEMENT (Max 5 squares)
    if ((movingPiece === '🏎️' || movingPiece === '🚙') && (rowDiff > 5 || colDiff > 5)) {
       alert("Traffic Jam! Cars can only travel 5 squares! 🏎️💨");
       selectedSquare = null; drawBoard(gameState); return;
    }

    // 3. 👑 KING MOVEMENT (Your special 2-step rule)
    if ((movingPiece === '👑' || movingPiece === '🤴') && (rowDiff > 2 || colDiff > 2)) {
       alert("The King is majestic but slow. 2 steps max! 👑");
       selectedSquare = null; drawBoard(gameState); return;
    }

    // 🏆 FALLMATE LOGIC
    if (piece === '👑' || piece === '🤴') {
       alert("FALLMATE! موت الملك! Mohamad Kings Victory! 👑🏆");
    }

    // 🐎 MOUNTING
    if ((movingPiece === '🛡️' || movingPiece === '💂') && (piece === '🐎' || piece === '🦄')) {
       gameState[row][col] = '🏇';
    } 
    // 🌯 PROMOTION LOGIC (Now for both teams!)
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
    document.getElementById('status').innerText = currentTurn === 'orange' ? "Orange's Turn" : "Brown's Turn";
    selectedSquare = null;
    drawBoard(gameState);
  }
}
