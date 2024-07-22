const selectLazyIcon = (player) => {
    if (player === "X") {
        return "static/images/game_icons/lazy_icons/xman-lazy.png";
    } else {
        return "static/images/game_icons/lazy_icons/oman-lazy.png";
    }
};

const selectRandomIcon = (player) => {
    let num = Math.floor(Math.random() * 6) + 1;
    if (num < 10) {
        num = "0" + num;
    }
    if (player === "X") {
        return `static/images/game_icons/x_icons/xman-${num}.png`;
    } else {
        return `static/images/game_icons/o_icons/oman-${num}.png`
    }
};

const areWeBeingLazy = () => {
    return Math.random() < 0.1; // 1 in 20 chance
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


// Set status color
function setStatusColor() {
    const header = document.querySelector("h1");
    const status = document.querySelector(".status");
    if (status.textContent === "X's Turn") {
        header.style.color = "var(--primary-blue)";
        status.style.color = "var(--primary-blue)";
    } else if (status.textContent === "O's Turn") {
        header.style.color = "var(--primary-light)";
        status.style.color = "var(--primary-light)";
    } else {
        header.style.color = "var(--primary-dark)";
        status.style.color = "var(--primary-dark)";
    }
}


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
        const cell = e.target.closest('.cell');
        const index = parseInt(cell.getAttribute("data-cell"));
        if (gameBoard.getGameBoard()[index] !== "" || !gameActive) {
            return;
        }
        const currentPlayerIcon = currentPlayer;
        gameBoard.setGameBoard(index, currentPlayerIcon);
        if (areWeBeingLazy()) {
            const lazyIcon = selectLazyIcon(currentPlayerIcon);
            cell.innerHTML = `<img src="${lazyIcon}" alt="${currentPlayerIcon}">`;
            setTimeout(() => {
                const randomIcon = selectRandomIcon(currentPlayerIcon);
                cell.innerHTML = `<img src="${randomIcon}" alt="${currentPlayerIcon}">`;
            }, 1000);
        } else {
            displayController.render();
        }
        const winner = checkWinner();
        if (winner) {
            gameActive = false;
            displayController.setStatus(`${winner} wins!`);
            displayController.setRestartButton("New Game");

            const endScreen = document.querySelector(".end-screen")
            const winnerText = document.createElement("h1");
            winnerText.textContent = `${winner} wins!`;
            endScreen.appendChild(winnerText);

            const gameBoard = document.querySelector(".game-board");
            const restartButton = document.querySelector(".restart-button");

            gameBoard.classList.add("fade");
            
            if (winner === "X") {
                endScreen.style.backgroundColor = "var(--primary-blue-opc)";
                endScreen.style.color = "var(--primary-blue)";
                restartButton.classList.add("winner-btn-blue");

            } else { 
                endScreen.style.backgroundColor = "var(--primary-light-opc)";
                endScreen.style.color = "var(--primary-light)";
                restartButton.classList.add("winner-btn-light");
            }

            endScreen.classList.add("show");

            restartButton.addEventListener("click", () => {
                endScreen.removeChild(winnerText);
                endScreen.classList.remove("show");
                gameBoard.classList.remove("fade");
                if (winner === "X") {
                    restartButton.classList.remove("winner-btn-blue");
                } else {
                    restartButton.classList.remove("winner-btn-light");
                }
            });
            displayController.render();
            return;
        }
        if (checkTie()) {
            gameActive = false;
            displayController.setStatus("It's a tie!");
            setStatusColor();
            displayController.setRestartButton("New Game");

            const endScreen = document.querySelector(".end-screen");
            const winnerText = document.createElement("h1");
            winnerText.textContent = "It's a tie!";
            endScreen.appendChild(winnerText);

            const gameBoard = document.querySelector(".game-board");
            const restartButton = document.querySelector(".restart-button");

            gameBoard.classList.add("fade");
            endScreen.style.backgroundColor = "var(--primary-dark-opc)";
            endScreen.style.color = "var(--primary-dark)";
            restartButton.classList.add("winner-btn-tie");
            endScreen.classList.add("show");

            restartButton.addEventListener("click", () => {
                endScreen.removeChild(winnerText);
                endScreen.classList.remove("show");
                gameBoard.classList.remove("fade");
                restartButton.classList.remove("winner-btn-tie");
            });

            displayController.render();
            return;
        }
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        displayController.setStatus(
            currentPlayer === "X" ? "X's Turn" : "O's Turn"
        );
        setStatusColor();
    };

    const handleRestart = () => {
        gameBoard.resetGameBoard();
        gameActive = true;
        currentPlayer = "X";
        displayController.render();
        displayController.setStatus("X's Turn");
        setStatusColor();
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
setStatusColor();
displayController.render();
