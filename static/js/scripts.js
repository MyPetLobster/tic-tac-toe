// GAME BOARD MODULE 
const gameBoard = (() => {
    const EMPTY_BOARD = Array(9).fill("");
    let gameBoard = [...EMPTY_BOARD];

    const getGameBoard = () => gameBoard;
    const setGameBoard = (index, value) => {
        gameBoard[index] = value;
    };
    const resetGameBoard = () => {
        gameBoard = [...EMPTY_BOARD];
    };

    return { getGameBoard, setGameBoard, resetGameBoard };
})();


// DISPLAY CONTROLLER MODULE
const displayController = (() => {
    const cells = document.querySelectorAll(".cell");
    const status = document.querySelector(".status");
    const restartButton = document.querySelector(".restart-button");

    const selectRandomIcon = (isX) => {
        let num = Math.floor(Math.random() * 6) + 1;
        num = num < 10 ? "0" + num : num;  // format string for image path
        return isX ? `static/images/game_icons/x_icons/xman-${num}.png` : `static/images/game_icons/o_icons/oman-${num}.png`;
    };

    const render = () => {
        gameBoard.getGameBoard().forEach((value, index) => {
            if (value === "") {
                cells[index].innerHTML = "";
            } 
        });
    };

    const setStatus = (message) => {
        status.textContent = message;
    };

    const setStatusColor = () => {
        const header = document.querySelector("h1")
        const color = status.textContent === "X's Turn" ? "var(--primary-blue)" : "var(--primary-light)";

        header.style.color = color;
        status.style.color = color;    
    };

    const setRestartButton = (message) => {
        restartButton.textContent = message;
    };

    const updateCellIcon = (cell, player) => {
        const randomIcon = selectRandomIcon(player === "X");
        cell.innerHTML = `<img src="${randomIcon}" alt="${player}">`;
    };

    const setLazyIcon = (cell, player, callback) => {
        const lazyIcon = player === "X" ? "static/images/game_icons/lazy_icons/xman-lazy.png" : "static/images/game_icons/lazy_icons/oman-lazy.png";
        
        cell.innerHTML = `<img src="${lazyIcon}" alt="${player}">`;
        setTimeout(callback, 600);
    };

    return { render, setStatus, setStatusColor, setRestartButton, updateCellIcon, setLazyIcon };
})();


// GAME CONTROLLER MODULE
const gameController = (() => {
    let currentPlayerIsX = true;
    let gameActive = true;
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // vertical
        [0, 4, 8], [2, 4, 6]              // diagonal
    ];
    
    const areWeBeingLazy = () => Math.random() < 0.1; // 10% chance of being lazy

    const checkWinner = () => {
        let winner = null;
        winningConditions.forEach(([a, b, c]) => {
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
        return gameBoard.getGameBoard().every(cell => cell !== "")
    };

    const handleEndGame = (winner) => {
        gameActive = false;
        // TODO - use backdrop-filter for blur effect
        const winningMessage = winner ? `${winner} wins!` : "It's a tie!";

        displayController.setStatus(winningMessage);
        displayController.setRestartButton("Play Again");

        const endScreen = document.querySelector(".end-screen");
        const winnerText = document.createElement("h1");
        winnerText.textContent = winningMessage;
        endScreen.appendChild(winnerText);

        const gameBoardElement = document.querySelector(".game-board");
        gameBoardElement.classList.add("fade")

        const  restartButton = document.querySelector(".restart-button");

        if (winner) {
            const colorClass = winner === "X" ? "blue" : "light";
            endScreen.style.backgroundColor = `var(--primary-${colorClass}-opc)`;
            endScreen.style.color = `var(--primary-${colorClass})`;
            restartButton.classList.add(`winner-btn-${colorClass}`);
        } else {
            endScreen.style.backgroundColor = "var(--primary-dark-opc)";
            endScreen.style.color = `var(--primary-dark)`;
            restartButton.classList.add("winner-tie-btn");
        }

        endScreen.classList.add("show");

        restartButton.addEventListener("click", () => {
            endScreen.removeChild(winnerText);
            endScreen.classList.remove("show");
            gameBoardElement.classList.remove("fade");
            restartButton.classList.remove(`winner-btn-${winner ? winner === "X" ? "blue" : "light" : "tie"}`);
        });

        displayController.render();
    };

    const handleCellClick = (e) => {
        const cell = e.target.closest(".cell");
        const index = Number(cell.getAttribute("data-cell"));

        // Check if cell is valid
        if (isNaN(index) || gameBoard.getGameBoard()[index] !== "" || !gameActive) return;

        const currentPlayer = currentPlayerIsX ? "X" : "O";
        gameBoard.setGameBoard(index, currentPlayer);

        if (areWeBeingLazy()) {
            displayController.setLazyIcon(cell, currentPlayer, () => {
                displayController.updateCellIcon(cell, currentPlayer);
            });
        } else {
            displayController.updateCellIcon(cell, currentPlayer);
        }

        const winner = checkWinner();
        if (winner) { 
            handleEndGame(winner);
            return;
        }

        if (checkTie()) {
            handleEndGame(null);
            return;
        }

        currentPlayerIsX = !currentPlayerIsX;
        displayController.setStatus(currentPlayerIsX ? "X's Turn" : "O's Turn");
        displayController.setStatusColor();
    };

    const handleRestart = () => {
        gameBoard.resetGameBoard();
        gameActive = true;
        currentPlayerIsX = true;
        displayController.render();
        displayController.setStatus("X's Turn");
        displayController.setStatusColor();
        displayController.setRestartButton("Restart");
    };

    return { handleCellClick, handleRestart };
})();


// INITIALIZATION MODULE
const init = (() => {
const checkCurrentPage = () => {
    const pageIdentifier = document.querySelector(".page-identifier");
    const currentPage = pageIdentifier.getAttribute("data-page");
    const activeLink = document.querySelector(`.${currentPage}-link`);
    const inactiveLink = document.querySelector(`.${currentPage === "home" ? "about" : "home"}-link`);

    activeLink.classList.add("active-nav");
    inactiveLink.classList.remove("active-nav");

    return currentPage;
};


    const page = checkCurrentPage();
    if (page === "home") {
        document.querySelectorAll(".cell").forEach((cell) => {
            cell.addEventListener("click", gameController.handleCellClick);
        });
        document.querySelector(".restart-button").addEventListener("click", gameController.handleRestart);

        // Initial Render
        displayController.setStatusColor();
        displayController.render();
    }
    
    checkCurrentPage();
})();