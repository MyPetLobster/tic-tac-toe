// Gameboard module
const gameBoard = (() => {
    let board = ["", "", "", "", "", "", "", "", ""];
    const getBoard = () => board;
    const setBoard = (index, value) => board[index] = value;
    const resetBoard = () => board = ["", "", "", "", "", "", "", "", ""];
    return { getBoard, setBoard, resetBoard };
})


// Player factory function
const Player = (name, marker) => {
    return { name, marker };
}

// Game module
const game = (() => {
    let player1 = Player("Player 1", "X");
    let player2 = Player("Player 2", "O");
    let currentPlayer = player1;
    let winner = null;
    let gameOver = false;
    let moves = 0;

    const checkWinner = () => {
        const board = gameBoard().getBoard();
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        winningCombos.forEach(combo => {
            if (board[combo[0]] == currentPlayer.marker && board[combo[1]] == currentPlayer.marker && board[combo[2]] == currentPlayer.marker) {
                winner = currentPlayer;
                gameOver = true;
            }
        });
        if (moves === 9 && !winner) {
            gameOver = true;
        }
    }

    const switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    }

    const playMove = (index) => { 
        if (gameBoard().getBoard()[index] === "" && ! gameOver) {
            gameBoard().setBoard(index, currentPlayer.marker);
            moves++;
            checkWinner();
            switchPlayer();
        }
    }

    const resetGame = () => {
        gameBoard().resetBoard();
        currentPlayer = player1;
        winner = null;
        gameOver = false;
        moves = 0;
    }

    return { playMove, resetGame, winner, gameOver, currentPlayer };

})


// Display module (CLI)
const displayControllerCLI = (() => {
    const displayBoard = () => {
        const board = gameBoard().getBoard();
        console.log(` ${board[0]} | ${board[1]} | ${board[2]} `);
        console.log(`---|---|---`);
        console.log(` ${board[3]} | ${board[4]} | ${board[5]} `);
        console.log(`---|---|---`);
        console.log(` ${board[6]} | ${board[7]} | ${board[8]} `);
    }

    const displayWinner = () => {
        if (game().winner) {
            console.log(`${game().winner.name} wins!`);
        }
    }
    
    const displayCurrentPlayer = () => {
        console.log(`${game().currentPlayer.name}'s turn`);
    }

    const displayGameOver = () => {
        if (game().gameOver) {
            console.log("Game over!");
        }
    }

    return { displayBoard, displayWinner, displayCurrentPlayer, displayGameOver };
})

// Display module (DOM)
// TODO: Implement displayControllerDOM



function playGameCLI () {
    displayControllerCLI().displayBoard();
    while (!game().gameOver) {
        displayControllerCLI().displayCurrentPlayer();
        let move = prompt("Enter a number between 0 and 8: ");
        game().playMove(move);
        displayControllerCLI().displayBoard();
    }
    displayControllerCLI().displayWinner();
    displayControllerCLI().displayGameOver();
}