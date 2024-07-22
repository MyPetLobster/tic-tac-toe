// #1 Should these be regular functions or arrow functions? Does it matter?
// #2 Or should these be moved into one of the modules?
// #3 Should I use a switch statement instead of if/else...or ternary operators?

// Return a random icon depending on player (each player has 6 icons to choose from).
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
const selectLazyIcon = (player) => {
    if (player === "X") {
        return "static/images/game_icons/lazy_icons/xman-lazy.png";
    } else {
        return "static/images/game_icons/lazy_icons/oman-lazy.png";
    }
};


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
    return currentPage
};



// GAME BOARD MODULE
// #4 is there some way to remove repetition of Array(9).fill("")?
const gameBoard = (() => {
    let gameBoard = Array(9).fill("");

    // Methods to get, set, and reset the game board
    const getGameBoard = () => gameBoard;
    const setGameBoard = (index, value) => {
        gameBoard[index] = value;
    };
    const resetGameBoard = () => {
        gameBoard = Array(9).fill("");
    };
    return { getGameBoard, setGameBoard, resetGameBoard };
})();

// #5 Should I move this into the display controller module? Being out here as a regular function seems out of place.
// Set status color
function setStatusColor() {
    const header = document.querySelector("h1");
    const status = document.querySelector(".status");
    // #6 Should I use a switch statement here? ...in fact when should I use a switch statements exactly?
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


// DISPLAY CONTROLLER MODULE
const displayController = (() => {

    // #7 Write a function to make writing querySelectors shorter 'qs(identifier)'?
    const cells = document.querySelectorAll(".cell");
    const status = document.querySelector(".status");
    const restartButton = document.querySelector(".restart-button");

    // Methods to render the game board, set the status & restart btn text content
    const render = () => {
        gameBoard.getGameBoard().forEach((value, index) => {
            if (value === "") {
                cells[index].innerHTML = "";
            // #8 Is if else okay here inside gameBoard.getGameBoard().forEach()?
            // #9 Can I just make the below into an else if statement? To remove one nesting level.
            } else {
                if (!cells[index].firstChild) {     // Make sure cell is unoccupied
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

    // Methods to check for a winner, a tie, and handle cell click
    const checkWinner = () => {
        let winner = null;
        winningConditions.forEach((condition) => {
            // For every condition, check if the game board has the same value at the indexes
            // #10 Is destructuring the right move here?
            // #11 Is there a more efficient way to check for a winner?
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
        // #12 Is this a good use of .every()? How efficient is .every() compared to alternatives?
        return gameBoard.getGameBoard().every((cell) => cell !== "");
    };

    const handleCellClick = (e) => {
        // #13 Is it okay to use closest() here? Is there a better way to get the cell index?
        const cell = e.target.closest('.cell');

        // #14 parseInt() will go until it finds a number...whereas Number() will return NaN if it finds a non-number character.
        // Which should I use here. Think about this.
        const index = parseInt(cell.getAttribute("data-cell"));
        if (gameBoard.getGameBoard()[index] !== "" || !gameActive) {
            return; // If cell is already occupied or game is over, do nothing
        }

        // #15 Should I bother defining a variable for currentPlayerIcon? Or just use currentPlayer? Idk why I did this.
        const currentPlayerIcon = currentPlayer;
        gameBoard.setGameBoard(index, currentPlayerIcon);

        // #16 I def think I should move areWeBeingLazy() and selectLazyIcon() into the gameController module.
        // #17 Think about if there's a better way to structure the lazy logic. Keep it all together maybe.
        if (areWeBeingLazy()) {
            const lazyIcon = selectLazyIcon(currentPlayerIcon);
            cell.innerHTML = `<img src="${lazyIcon}" alt="${currentPlayerIcon}">`;
            setTimeout(() => {
                const randomIcon = selectRandomIcon(currentPlayerIcon);
                cell.innerHTML = `<img src="${randomIcon}" alt="${currentPlayerIcon}">`;
            }, 700);
        } else {
            displayController.render();
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
        // #24 Should I make currentPlayer a boolean instead of a string?
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



// #25 Should I move this into a module?
// Event listeners
const page = checkCurrentPage();
if (page === "home") {
    document.querySelectorAll(".cell").forEach((cell) => {
        cell.addEventListener("click", gameController.handleCellClick);
    });
    document.querySelector(".restart-button").addEventListener("click", gameController.handleRestart);

    // Initial render
    setStatusColor();
    displayController.render();
}

const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
    checkCurrentPage();
});


