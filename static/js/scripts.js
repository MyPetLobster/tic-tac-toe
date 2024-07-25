// GAME BOARD LOGIC MODULE
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

    const areWeBeingLazy = () => Math.random() < 0.05; // 5% chance of being lazy

    const checkWinner = () => {
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  // horizontal
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  // vertical
            [0, 4, 8], [2, 4, 6]              // diagonal
        ];

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
        if (!bestOf3Mode) {
            displayController.setRestartButton("Play Again");
        }

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
                // 'winner-btn' classes make the button move from btn bar to the endgame screen
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
            // If bestOf3Mode is activated, the endgame screen will be hidden automatically
            restartButton.addEventListener("click", restartGame);
        }

        endScreen.classList.add("show");

        // Best of 3 Mode Endgame Logic
        if (bestOf3Mode) {
            restartButton.addEventListener("click", () => {
                xScore = 0;
                oScore = 0;
                restartGame();
            });
            if (winner === "X") {
                xScore++;
            } else if (winner === "O") {
                oScore++;
            }
            displayController.updateScoreboard();

            // Display winner of best of 3 after 2 wins
            if (xScore === 2 || oScore === 2) {
                winnerText.classList.add("winner-text-best-of-3");
                winnerText.textContent = xScore === 2 ? "X wins Best of 3!" : "O wins Best of 3!";
                endScreen.style.backgroundColor = xScore === 2 ? "var(--primary-blue-opc)" : "var(--primary-light-opc)";
                endScreen.style.color = xScore === 2 ? "var(--primary-blue)" : "var(--primary-light)";
                restartButton.textContent = "Go again?";
                restartButton.classList.add(`winner-btn-${xScore === 2 ? "blue" : "light"}`);
            // Automatically start new game after 2 seconds until someone wins best of 3
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

        // Lazy mode just shows a stick figure being caught off guard on duty for a split second
        if (areWeBeingLazy()) {
            displayController.setLazyIcon(cell, currentPlayer, () => {
                displayController.updateCellIcon(cell, currentPlayer);
                if (aiMode && currentPlayer === "X") {
                    gameActive = false;     // Prevent player from clicking while AI is 'thinking'
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
        const scores = { X: -10, O: 10, tie: 0 };               // -10, 10 and 0 are arbitrary values. Could be -1, 1, 0, etc.
        const winner = checkWinner();


        if (winner) {                                           // Check for base cases (win, lose, tie)
            return scores[winner];
        }
        if (checkTie()) {
            return scores.tie;
        }

        if (isMaximizing) {                                     // Maximizing player (aka always AI in my implementation)
            let bestValue = -Infinity;                          // Negative infinity is the worst possible value for maximizing player

            for (let i = 0; i < board.length; i++) {            // Loop through each cell
                if (board[i] === "") {                          // If cell is empty
                    board[i] = "O";                             // Make the move
                    let value = minimax(board, false);          // Recursive call with the new board state to simulate the minimizing player (value becomes the returned 'bestValue' from the recursive call)
                    board[i] = "";                              // Undo the move
                    bestValue = Math.max(value, bestValue);     // Compare each turn to the best value so far
                }
            }
            return bestValue;                                   // Return best value 
        } else {
            let bestValue = Infinity;                           // Same for minimizing player (in this case it's the AI simulating the human player's best move)

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
        let bestMove = null;                                    // Initialize best move to null
        let bestValue = -Infinity;                              // Initialize best value to negative infinity

        for (let i = 0; i < board.length; i++) {                // Loop through each cell
            if (board[i] === "") {                              // If cell is empty
                board[i] = "O";                                 // Make the move
                let moveValue = minimax(board, false);          // Call minimax with the new board state
                board[i] = "";                                  // Undo the move
                if (moveValue > bestValue) {                    // If the move value is greater than the best value so far
                    bestMove = i;                               // Update the best move
                    bestValue = moveValue;                      // Update the best value
                }
            }
        }

        // Got sick of being destroyed by AI during testing. So I added a little bit of randomness to the AI's decision making.
        // Nobody beats me at tic tac toe (checks notes) 214 times in a row!
        // It's comeback time baby! 

        // 10% chance for AI to make random move instead of the best move
        if (Math.random() < 0.1) {
            const emptyCells = board.map((cell, index) => cell === "" ? index : null).filter(cell => cell !== null);
            bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }


        return bestMove;                                        // Return the best move for AI to make
    };

    const aiTurn = () => {
        const bestMove = getBestMove(gameBoard.getGameBoard());
        gameBoard.setGameBoard(bestMove, "O");
        const cell = document.querySelector(`.cell[data-cell="${bestMove}"]`);
        displayController.updateCellIcon(cell, "O");

        const winner = checkWinner();
        if (winner === "O") {           // AI wins end game. Player wins handled inside handleCellClick
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
        gameActive = true;      // Re-enable player clicks once AI has made its move
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

    // Expose methods to get and set encapsulated variables (Fixes issue with encapsulating global variables)
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
        // There are six different icons for each player
        let num = Math.floor(Math.random() * 6) + 1;
        num = num < 10 ? "0" + num : num;  // format string for image path
        return isX ? `static/images/game_icons/x_icons/xman-${num}.png` : `static/images/game_icons/o_icons/oman-${num}.png`;
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

    const render = () => {
        gameBoard.getGameBoard().forEach((value, index) => {
            if (value === "") {
                cells[index].innerHTML = "";
            } 
        });
    };

    return { render, setStatus, setStatusColor, setRestartButton, updateCellIcon, setLazyIcon, updateScoreboard };
})();




// INITIALIZATION and NAVIGATION MODULE
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