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


// GAME CONTROLLER MODULE
const gameController = (() => {
    let aiMode = false;
    let xScore = 0;
    let oScore = 0;
    let bestOf3Mode = false;

    let currentPlayerIsX = true;
    let gameActive = true;
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // vertical
        [0, 4, 8], [2, 4, 6]              // diagonal
    ];
    
    const areWeBeingLazy = () => Math.random() < 0.05; // 5% chance of being lazy

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
        const winningMessage = winner ? `${winner} wins!` : "It's a tie!";
        
        displayController.setStatus(winningMessage);
        displayController.setRestartButton("Play Again");

        const endScreen = document.querySelector(".end-screen");
        const winnerText = document.createElement("h1");
        winnerText.textContent = winningMessage;
        endScreen.appendChild(winnerText);

        const restartButton = document.querySelector(".restart-button");

        if (winner) {
            const colorClass = winner === "X" ? "blue" : "light";
            endScreen.style.backgroundColor = `var(--primary-${colorClass}-opc)`;
            endScreen.style.color = `var(--primary-${colorClass})`;
            if (!bestOf3Mode) {
                restartButton.classList.add(`winner-btn-${colorClass}`);
            }
        } else {
            endScreen.style.backgroundColor = "var(--primary-dark-opc)";
            endScreen.style.color = `var(--primary-dark)`;
            if (!bestOf3Mode) {
                restartButton.classList.add("winner-btn-tie");
            }
        }

        if (!bestOf3Mode) {
            restartButton.addEventListener("click", restartGame);
        }

        endScreen.classList.add("show");

        if (bestOf3Mode) {
            if (winner === "X") {
                xScore++;
            } else if (winner === "O") {
                oScore++;
            }
            displayController.updateScoreboard();
            if (xScore === 2 || oScore === 2) {
                winnerText.classList.add("winner-text-best-of-3");
                winnerText.textContent = xScore === 2 ? "X wins Best of 3!" : "O wins Best of 3!";
                endScreen.style.backgroundColor = xScore === 2 ? "var(--primary-blue-opc)" : "var(--primary-light-opc)";
                endScreen.style.color = xScore === 2 ? "var(--primary-blue)" : "var(--primary-light)";
                restartButton.classList.add(`winner-btn-${xScore === 2 ? "blue" : "light"}`);
                restartButton.addEventListener("click", () => {
                    xScore = 0;
                    oScore = 0;
                    restartGame();
                });
            } else {
                setTimeout(() => {
                    endScreen.removeChild(winnerText);
                    endScreen.classList.remove("show");
                    restartGame();
                }, 2000);
            }
        }

        displayController.render();
    };

    const handleCellClick = (e) => {
        if (!gameActive) return;  // Prevent clicks when game is inactive

        const cell = e.target.closest(".cell");
        const index = Number(cell.getAttribute("data-cell"));

        if (isNaN(index) || gameBoard.getGameBoard()[index] !== "") return;

        const currentPlayer = currentPlayerIsX ? "X" : "O";
        gameBoard.setGameBoard(index, currentPlayer);

        if (areWeBeingLazy()) {
            displayController.setLazyIcon(cell, currentPlayer, () => {
                displayController.updateCellIcon(cell, currentPlayer);
                if (aiMode && currentPlayer === "X") {
                    gameActive = false;
                    setTimeout(aiTurn, 500);
                }
            });
        } else {
            displayController.updateCellIcon(cell, currentPlayer);
            if (aiMode && currentPlayer === "X") {
                gameActive = false;
                setTimeout(aiTurn, 500);
            }
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


    // Minimax Algorithm
    const minimax = (board, isMaximizing) => {
        const scores = { X: -10, O: 10, tie: 0 };

        const winner = checkWinner();
        if (winner) {
            return scores[winner];
        }

        if (checkTie()) {
            return scores.tie;
        }

        if (isMaximizing) {
            let bestValue = -Infinity;

            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = "O";
                    let value = minimax(board, false);
                    board[i] = "";
                    bestValue = Math.max(value, bestValue);
                }
            }
            return bestValue;
        } else {
            let bestValue = Infinity;

            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = "X";
                    let value = minimax(board, true);
                    board[i] = "";
                    bestValue = Math.min(value, bestValue);
                }
            }
            return bestValue;
        }
    };

    const getBestMove = (board) => {
        let bestMove = null;
        let bestValue = -Infinity;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let moveValue = minimax(board, false);
                board[i] = "";
                if (moveValue > bestValue) {
                    bestMove = i;
                    bestValue = moveValue;
                }
            }
        }
        return bestMove;
    };

    const aiTurn = () => {
        const bestMove = getBestMove(gameBoard.getGameBoard());
        gameBoard.setGameBoard(bestMove, "O");
        const cell = document.querySelector(`.cell[data-cell="${bestMove}"]`);
        displayController.updateCellIcon(cell, "O");

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
        gameActive = true;
    };

    const restartGame = () => {
        const endScreen = document.querySelector(".end-screen");
        const winnerText = endScreen.querySelector("h1");
        const restartButton = document.querySelector(".restart-button");

        if (endScreen.classList.contains("show")) {
            endScreen.removeChild(winnerText);
            endScreen.classList.remove("show");
            restartButton.classList.remove("winner-btn-blue", "winner-btn-light", "winner-btn-tie");
        }
        
        if (bestOf3Mode) {
            displayController.updateScoreboard();
        }

        gameBoard.resetGameBoard();
        gameActive = true;
        currentPlayerIsX = true;
        displayController.render();
        displayController.setStatus("X's Turn");
        displayController.setStatusColor();
        displayController.setRestartButton("Restart");
    };

    // Expose methods to get and set encapsulated variables
    return { 
        handleCellClick, 
        restartGame, 
        checkWinner, 
        checkTie, 
        handleEndGame, 
        getAIMode: () => aiMode, 
        setAIMode: (mode) => aiMode = mode, 
        getBestOf3Mode: () => bestOf3Mode, 
        setBestOf3Mode: (mode) => bestOf3Mode = mode,
        getXScore: () => xScore,
        getOScore: () => oScore,
        setXScore: (score) => xScore = score,
        setOScore: (score) => oScore = score,
    };
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
        const lazyIcon = player === "X" ? "static/images/game_icons/lazy_icons/xman-lazy.png" : `static/images/game_icons/lazy_icons/oman-lazy.png`;
        cell.innerHTML = `<img src="${lazyIcon}" alt="${player}">`;
        setTimeout(callback, 500);
    };

    const updateScoreboard = () => {
        const mainH1 = document.getElementById("main-h1");
        const bestOf3Mode = gameController.getBestOf3Mode();
        const xScore = gameController.getXScore();
        const oScore = gameController.getOScore();
    
        if (bestOf3Mode) {
            mainH1.innerHTML = `<span style="color:var(--primary-blue)">X: ${xScore} </span>
                                <span style="color:var(--primary-dark)">vs.</span> 
                                <span style="color:var(--primary-light)">O: ${oScore}</span>`;
        } else {
            mainH1.innerHTML = `Tic Tac Toe`;
        }
    };

    return { render, setStatus, setStatusColor, setRestartButton, updateCellIcon, setLazyIcon, updateScoreboard };
})();


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
        // Main game page event listeners
        document.querySelectorAll(".cell").forEach((cell) => {
            cell.addEventListener("click", gameController.handleCellClick);
        });
        document.querySelector(".restart-button").addEventListener("click", gameController.restartGame);

        const AIButton = document.querySelector(".ai-button");
        AIButton.addEventListener("click", () => {
            const aiMode = gameController.getAIMode();
            gameController.setAIMode(!aiMode);
            AIButton.textContent = aiMode ? "Play vs AI" : "Switch to PvP";
            gameController.restartGame();
        });

        const bestOf3Button = document.querySelector(".best-of-3-button");
        bestOf3Button.addEventListener("click", () => {
            const bestOf3Mode = gameController.getBestOf3Mode();
            gameController.setBestOf3Mode(!bestOf3Mode);
            bestOf3Button.textContent = bestOf3Mode ? "Best of 3: OFF" : "Best of 3: ON";
            gameController.setXScore(0);
            gameController.setOScore(0);
            displayController.updateScoreboard();
            gameController.restartGame();
        });

        // Initial Render
        displayController.setStatusColor();
        displayController.render();
    }

    checkCurrentPage();
})();
