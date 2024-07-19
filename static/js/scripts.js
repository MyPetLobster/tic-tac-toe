const boardSize = 3

// for (let i = 0; i < boardSize; i++) {
//     if (i === 2) {
//         console.log(" | | ");
//     } else {
//         console.log("_|_|_");
//     }
// }

// Create 2d array 

// Visualization of board

// '0, 0' | '0, 1' | '0, 2'
// -------|--------|-------
// '1, 0' | '1, 1' | '1, 2'
// -------|--------|-------
// '2, 0' | '2, 1' | '2, 2' 





const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function createBoard (rows=3, cols=3) {
    const board = [];
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i][j] = `${i}, ${j}`;
        }
    }
    return board
}

function displayBoard (board) {
    for (let i = 0; i < board[0]; i++) {
        console.log('------');
        for (let j = 0; j < board[0]; j++) {
            console.log(`| ${board[i][j]} |`)
        }
    }
}


function makeMove (player, board) {

    readline.question(`player-${player}, make your move! (e.g. '0,0' for top left)`, (move) => {
        console.log(move);
        readline.close();
    });
    // const x = move.split(',')[0];
    // const y = move.split(',')[1];
    // board[x][y] = player === 1 ? "X" : "O";
    // displayBoard(board);
    // return board;
}



function playGame() {
    board = createBoard(3,3);
    let gameActive = true;
    displayBoard(board);

    let player1 = true;
    while (gameActive) {
        if (player1) {
            board = makeMove(1, board);
        } else {
            board = makeMove(2, board);
        }
        player1 != player1;
    }
}


function checkForWinner(board) {
    
}


playGame();