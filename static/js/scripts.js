


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

    const render = () => {
        gameBoard.getGameBoard().forEach((value, index) => {
            if (value === "") {
                cells[index].innerHTML = "";
            } else if (!cells[index].firstChild) {     // Make sure cell is unoccupied
                const randomIcon = selectRandomIcon(value);
                const iconImgElement = document.createElement("img");
                iconImgElement.src = randomIcon;
                iconImgElement.alt = value;
                cells[index].appendChild(iconImgElement);
            }        
        });
    };

    const setStatus = (message) => {
        status.textContent = message;
    };

    const setStatusColor = () => {
        const header = document.querySelector("h1");
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
    };

    const setRestartButton = (message) => {
        restartButton.textContent = message;
    };
    return { render, setStatus, setStatusColor, setRestartButton };
})();

// GAME CONTROLLER MODULE
const gameController = (() => {
    let currentPlayerIsX = true; // Boolean to track current player
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

    const selectRandomIcon = (isX) => {
        let num = Math.floor(Math.random() * 6) + 1;
        num = num < 10 ? "0" + num : num;
        return isX ? `static/images/game_icons/x_icons/xman-${num}.png` : `static/images/game_icons/o_icons/oman-${num}.png`;
    };

    const areWeBeingLazy = () => Math.random() < 0.1;

    const selectLazyIcon = (isX) => isX ? "static/images/game_icons/lazy_icons/xman-lazy.png" : "static/images/game_icons/lazy_icons/oman-lazy.png";

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
        return gameBoard.getGameBoard().every(cell => cell !== "");
    };

    const handleEndGame = (winner) => {
        gameActive = false;
        displayController.setStatus(winner ? `${winner} wins!` : "It's a tie!");
        displayController.setRestartButton("New Game");

        const endScreen = document.querySelector(".end-screen");
        const winnerText = document.createElement("h1");
        winnerText.textContent = winner ? `${winner} wins!` : "It's a tie!";
        endScreen.appendChild(winnerText);

        const gameBoardElement = document.querySelector(".game-board");
        gameBoardElement.classList.add("fade");

        const restartButton = document.querySelector(".restart-button");

        if (winner) {
            const colorClass = winner === "X" ? "blue" : "light";
            endScreen.style.backgroundColor = `var(--primary-${colorClass}-opc)`;
            endScreen.style.color = `var(--primary-${colorClass})`;
            restartButton.classList.add(`winner-btn-${colorClass}`);
        } else {
            endScreen.style.backgroundColor = "var(--primary-dark-opc)";
            endScreen.style.color = "var(--primary-dark)";
            restartButton.classList.add("winner-btn-tie");
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
        const cell = e.target.closest('.cell');
        const index = Number(cell.getAttribute("data-cell"));
        if (isNaN(index) || gameBoard.getGameBoard()[index] !== "" || !gameActive) {
            return;
        }

        const currentPlayer = currentPlayerIsX ? "X" : "O";
        gameBoard.setGameBoard(index, currentPlayer);

        const updateCellIcon = () => {
            const randomIcon = selectRandomIcon(currentPlayerIsX);
            cell.innerHTML = `<img src="${randomIcon}" alt="${currentPlayer}">`;
        };

        if (areWeBeingLazy()) {
            const lazyIcon = selectLazyIcon(currentPlayerIsX);
            cell.innerHTML = `<img src="${lazyIcon}" alt="${currentPlayer}">`;
            setTimeout(updateCellIcon, 700);
        } else {
            updateCellIcon();
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
        displayController.setStatus(
            currentPlayerIsX ? "X's Turn" : "O's Turn"
        );
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
        if (currentPage === "home") {
            document.querySelector(".about-link").classList.remove("active-nav");
            document.querySelector(".home-link").classList.add("active-nav");
        } else if (currentPage === "about") {
            document.querySelector(".home-link").classList.remove("active-nav");
            document.querySelector(".about-link").classList.add("active-nav");
        }
        return currentPage;
    };

    const page = checkCurrentPage();
    if (page === "home") {
        document.querySelectorAll(".cell").forEach((cell) => {
            cell.addEventListener("click", gameController.handleCellClick);
        });
        document.querySelector(".restart-button").addEventListener("click", gameController.handleRestart);

        // Initial render
        displayController.setStatusColor();
        displayController.render();
    }

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
        checkCurrentPage();
    });
})();


