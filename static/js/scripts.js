// Select Random X-man
const selectRandomIcon = (player) => {
    let num = Math.floor(Math.random() * 6) + 1;
    if (num < 10) {
        num = "0" + num;
    }
    if (player === "X") {
        return `static/images/game_icons/x_icons/xman-${num}.png`;
    } else {
        return`static/images/game_icons/o_icons/oman-${num}.png`
    }
};





// Gameboard module
const gameBoard = (() => {
    let gameBoard = ["", "", "", "", "", "", "", "", ""];
    const getGameBoard = () => gameBoard;
    const setGameBoard = (index, value) => {
        gameBoard[index] = value;
    };
    const resetGameBoard = () => {
        gameBoard = ["", "", "", "", "", "", "", "", ""];
    };
    return { getGameBoard, setGameBoard, resetGameBoard };
})();

// Display controller module
const displayController = (() => {
    const cells = document.querySelectorAll(".cell");
    const status = document.querySelector(".status");
    const restartButton = document.querySelector(".restart-button");
    const render = () => {
        gameBoard.getGameBoard().forEach((value, index) => {
            if (value === "") {
                cells[index].innerHTML = "";
            } else {
                if (!cells[index].firstChild) {
                    const randomIcon = selectRandomIcon(value);
                    const iconImgElement = document.createElement("img");
                    iconImgElement.src = randomIcon;
                    iconImgElement.alt = value;
                    cells[index].appendChild(iconImgElement);
                }
            }
        });
    };
    const setStatus = (message) => {
        status.textContent = message;
    };
    const setRestartButton = (message) => {
        restartButton.textContent = message;
    };
    return { render, setStatus, setRestartButton };
})();

// Game controller module
const gameController = (() => {
    let currentPlayer = "X";
    let gameActive = true;
    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    const checkWinner = () => {
        let winner = null;
        winningConditions.forEach((condition) => {
            const [a, b, c] = condition;
            if (
                gameBoard.getGameBoard()[a] &&
                gameBoard.getGameBoard()[a] === gameBoard.getGameBoard()[b] &&
                gameBoard.getGameBoard()[a] === gameBoard.getGameBoard()[c]
            ) {
                winner = gameBoard.getGameBoard()[a];
            }
        });
        return winner;
    };
    const checkTie = () => {
        return gameBoard.getGameBoard().every((cell) => cell !== "");
    };
    const handleCellClick = (e) => {
        const cell = e.target;
        const index = parseInt(cell.getAttribute("data-cell"));
        if (gameBoard.getGameBoard()[index] !== "" || !gameActive) {
            return;
        }
        gameBoard.setGameBoard(index, currentPlayer);
        displayController.render();
        const winner = checkWinner();
        if (winner) {
            gameActive = false;
            displayController.setStatus(`${winner} wins!`);
            displayController.setRestartButton("Restart");
            return;
        }
        if (checkTie()) {
            gameActive = false;
            displayController.setStatus("It's a tie!");
            displayController.setRestartButton("Restart");
            return;
        }
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        displayController.setStatus(
            currentPlayer === "X" ? "Player 1's Turn" : "Player 2's Turn"
        );
    };
    const handleRestart = () => {
        gameBoard.resetGameBoard();
        gameActive = true;
        currentPlayer = "X";
        displayController.render();
        displayController.setStatus("Player 1's Turn");
        displayController.setRestartButton("Restart");
    };
    return { handleCellClick, handleRestart };
})();

// Event listeners
document.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener("click", gameController.handleCellClick);
});
document.querySelector(".restart-button").addEventListener("click", gameController.handleRestart);

// Initial render
displayController.render();