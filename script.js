// --- 1. SUPABASE CONFIG ---
// I've plugged in your specific URL and Anon Key below!
const supabaseUrl = 'https://bpdckzmedlrpkkogkrtv.supabase.co';
const supabaseKey = 'sb_publishable_HnSlQ7Azs57FlMVhaSNAUA_GsqI2Bru';

// Note: We use 'supabase.createClient' after the library is loaded in your HTML
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- 2. GAME STATE VARIABLES ---
let selectedSquare = null;
let currentTurn = 'orange';
let gameActive = true;
let currentUser = null; 

const orangeTeam = ['👑', '🛡️', '🕌', '🏎️', '🐎', '🏇', '💎'];
const brownTeam  = ['🤴', '💂', '🕍', '🚙', '🦄', '🏇', '💠'];

// Default starting board
let gameState = Array(10).fill(null).map(() => Array(10).fill(' '));
gameState[0] = ['🚙', ' ', ' ', '🕍', '🤴', '🦄', ' ', ' ', ' ', '🚙'];
gameState[1] = Array(10).fill('💂');
gameState[9] = ['🏎️', ' ', ' ', '🕌', '👑', '🐎', ' ', ' ', ' ', '🏎️'];
gameState[8] = Array(10).fill('🛡️');

// --- 3. CLOUD FUNCTIONS ---

// Sync game to cloud whenever a move happens
async function syncGameToCloud() {
  if (!currentUser) return; 

  const { error } = await supabase
    .from('profiles')
    .update({ 
      last_board_state: JSON.stringify(gameState), 
      current_turn: currentTurn 
    })
    .eq('id', currentUser.id);

  if (error) console.error("Cloud Sync Error:", error.message);
}

// Load game from cloud when user logs in
async function loadSavedGame() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    currentUser = user;
    const { data, error } = await supabase
      .from('profiles')
      .select('last_board_state, current_turn')
      .single();

    if (data && data.last_board_state) {
      gameState = JSON.parse(data.last_board_state);
      currentTurn = data.current_turn || 'orange';
      console.log("Welcome back, King! Game loaded. 👑");
      drawBoard(gameState);
    }
  }
}

// --- 4. GAME LOGIC ---

function drawBoard(currentBoardState) {
  const boardElement = document.getElementById('game-board');
  if (!boardElement) return;
  boardElement.innerHTML = '';
  
  currentBoardState.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      const square = document.createElement('div');
      // Adding basic classes for styling
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

    // Move piece logic
    gameState[row][col] = movingPiece; 
    gameState[fromRow][fromCol] = ' ';

    // Check for King capture (Fallmate)
    if (piece === '👑' || piece === '🤴') {
       gameActive = false;
       alert("FALLMATE! موت الملك! 👑🏆");
    }

    if (gameActive) {
        currentTurn = (currentTurn === 'orange') ? 'brown' : 'orange';
        // ☁️ SYNC TO SUPABASE AFTER EVERY MOVE
        syncGameToCloud();
    }

    selectedSquare = null;
    drawBoard(gameState);
  }
}

window.onload = () => {
    loadSavedGame();
    drawBoard(gameState);
};
