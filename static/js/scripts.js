


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
            // TODO - Bitwise win check
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

    // Return true 10% of the time
    const areWeBeingLazy = () => {
        return Math.random() < 0.1;
    };

    // Return the correct lazy icon based on the player
    const selectLazyIcon = (player) => player === "X" ? "static/images/game_icons/lazy_icons/xman-lazy.png" : "static/images/game_icons/lazy_icons/oman-lazy.png";

    const checkTie = () => {
        return gameBoard.getGameBoard().every((cell) => cell !== "");
    };

    const handleCellClick = (e) => {
        // TODO - Test this using just e.target
        const cell = e.target.closest('.cell');
        const index = Number(cell.getAttribute("data-cell"));

        if (isNaN(index) || gameBoard.getGameBoard()[index] !== "" || !gameActive) {
            return; // If cell is already occupied or game is over, do nothing
        }

        gameBoard.setGameBoard(index, currentPlayer);

        const updateCellIcon = () => {
            const randomIcon = selectRandomIcon(currentPlayer);
            cell.innerHTML = `<img src="${randomIcon}" alt="${currentPlayer}">`;
        };

        if (areWeBeingLazy()) {
            const lazyIcon = selectLazyIcon(currentPlayer);
            cell.innerHTML = `<img src="${lazyIcon}" alt="${currentPlayer}">`;
            setTimeout(updateCellIcon, 700);
        } else {
            updateCellIcon();
        }

        // #18 Definitely need to refactor this and remove the repetition
        const winner = checkWinner();
        if (winner) {
            gameActive = false;
            displayController.setStatus(`${winner} wins!`);
            displayController.setRestartButton("New Game");

            // Create end screen for winner
            const endScreen = document.querySelector(".end-screen")
            const winnerText = document.createElement("h1");
            winnerText.textContent = `${winner} wins!`;
            endScreen.appendChild(winnerText);

            // Fade and blur game board
            const gameBoard = document.querySelector(".game-board");
            gameBoard.classList.add("fade");

            // #19 Should I define the variables close to where I use them or is it better to define each
            // function/block's variables together at the top of the highest level in which they are used?
            const restartButton = document.querySelector(".restart-button");
            
            // #20 Is it possible to use a ternary operator to do all three of these changes in one statement?
            // #21 Am I overthinking all that and if/else are fine even though I learned cool new things?
            if (winner === "X") {
                // #22 Anything wrong with using CSS variables like this? Also...should I use fallbacks in my CSS file
                // for these variables?
                endScreen.style.backgroundColor = "var(--primary-blue-opc)";
                endScreen.style.color = "var(--primary-blue)";
                restartButton.classList.add("winner-btn-blue");

            } else { 
                endScreen.style.backgroundColor = "var(--primary-light-opc)";
                endScreen.style.color = "var(--primary-light)";
                restartButton.classList.add("winner-btn-light");
            }
            endScreen.classList.add("show");

            // #23 I feel like this was a hacky way to make this work. Is there a better way to do this?
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
            displayController.setStatusColor();
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
        // #24 Should I make currentPlayer a boolean instead of a string?
        displayController.setStatus(
            currentPlayer === "X" ? "X's Turn" : "O's Turn"
        );
        displayController.setStatusColor();
    };

    const handleRestart = () => {
        gameBoard.resetGameBoard();
        gameActive = true;
        currentPlayer = "X";
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


