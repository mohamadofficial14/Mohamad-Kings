const board = document.getElementById('game-board');

// 1. The Piece Layout for the Back Rank (Rank 0 and Rank 9)
// C=Car, M=Minister(Mosque), K=King, H=Horse, E=Empty
const orangeBackRank = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
const brownBackRank  = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];

function createBoard() {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const square = document.createElement('div');
      square.className = 'square';
      
      // Alternate colors: Warm Orange and Wooden Brown
      if ((row + col) % 2 === 0) {
        square.classList.add('orange-sq');
      } else {
        square.classList.add('brown-sq');
      }

      // 2. Spawn the Orange Army (Bottom of board)
      if (row === 9) { // Rank 1
        square.innerText = orangeBackRank[col];
        square.classList.add('orange-piece');
      } else if (row === 8) { // Rank 2
        square.innerText = '🛡️'; // Soldier
        square.classList.add('orange-piece');
      }

      // 3. Spawn the Brown Army (Top of board)
      if (row === 0) { // Rank 1
        square.innerText = brownBackRank[col];
        square.classList.add('brown-piece');
      } else if (row === 1) { // Rank 2
        square.innerText = '🛡️'; // Soldier
        square.classList.add('brown-piece');
      }

      board.appendChild(square);
    }
  }
}

createBoard();
