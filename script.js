document.addEventListener("DOMContentLoaded", () => {
  const BOARD_SIZE = 10;
  const MINE_COUNT = 10;

  const boardElement = document.getElementById("board");
  const mineCountElement = document.getElementById("mine-count");
  const timerElement = document.getElementById("timer");
  const resetBtn = document.getElementById("reset-btn");
  const statusMessage = document.getElementById("status-message");

  let board = [];
  let flags = 0;
  let timer = null;
  let timeElapsed = 0;
  let isGameOver = false;
  let isFirstClick = true;

  function initGame() {
    // Clear state
    boardElement.innerHTML = "";
    statusMessage.textContent = "";
    resetBtn.textContent = "😊";
    flags = 0;
    timeElapsed = 0;
    isGameOver = false;
    isFirstClick = true;
    clearInterval(timer);
    timerElement.textContent = "000";
    mineCountElement.textContent = MINE_COUNT;

    // Create Board Structure
    board = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = {
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
          element: null
        };

        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.addEventListener("click", () => handleLeftClick(cell));
        cellElement.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          handleRightClick(cell);
        });

        cell.element = cellElement;
        boardElement.appendChild(cellElement);
        row.push(cell);
      }
      board.push(row);
    }
  }

  function startTimer() {
    timer = setInterval(() => {
      timeElapsed++;
      timerElement.textContent = String(timeElapsed).padStart(3, "0");
    }, 1000);
  }

  function placeMines(firstR, firstC) {
    let placed = 0;
    while (placed < MINE_COUNT) {
      const r = Math.floor(Math.random() * BOARD_SIZE);
      const c = Math.floor(Math.random() * BOARD_SIZE);

      // Avoid placing mine on first clicked cell or existing mine
      if (!board[r][c].isMine && !(r === firstR && c === firstC)) {
        board[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate adjacent numbers
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!board[r][c].isMine) {
          board[r][c].adjacentMines = getNeighbors(r, c).filter(n => n.isMine).length;
        }
      }
    }
  }

  function getNeighbors(r, c) {
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          neighbors.push(board[nr][nc]);
        }
      }
    }
    return neighbors;
  }

  function handleLeftClick(cell) {
    if (isGameOver || cell.isFlagged || cell.isRevealed) return;

    if (isFirstClick) {
      isFirstClick = false;
      placeMines(cell.r, cell.c);
      startTimer();
    }

    if (cell.isMine) {
      endGame(false);
      cell.element.classList.add("mine");
      cell.element.textContent = "💣";
      return;
    }

    revealCell(cell);
    checkWin();
  }

  function handleRightClick(cell) {
    if (isGameOver || cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    if (cell.isFlagged) {
      cell.element.textContent = "🚩";
      flags++;
    } else {
      cell.element.textContent = "";
      flags--;
    }

    mineCountElement.textContent = MINE_COUNT - flags;
  }

  function revealCell(cell) {
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.element.classList.add("revealed");

    if (cell.adjacentMines > 0) {
      cell.element.textContent = cell.adjacentMines;
      cell.element.setAttribute("data-count", cell.adjacentMines);
    } else {
      // Flood fill (reveal adjacent empty cells recursively)
      const neighbors = getNeighbors(cell.r, cell.c);
      neighbors.forEach(n => revealCell(n));
    }
  }

  function checkWin() {
    let unrevealedNonMines = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!board[r][c].isMine && !board[r][c].isRevealed) {
          unrevealedNonMines++;
        }
      }
    }

    if (unrevealedNonMines === 0) {
      endGame(true);
    }
  }

  function endGame(won) {
    isGameOver = true;
    clearInterval(timer);

    if (won) {
      resetBtn.textContent = "😎";
      statusMessage.textContent = "🎉 You Win!";
      statusMessage.style.color = "#22c55e";
    } else {
      resetBtn.textContent = "😵";
      statusMessage.textContent = "💥 Game Over!";
      statusMessage.style.color = "#ef4444";

      // Reveal all remaining mines
      board.flat().forEach(cell => {
        if (cell.isMine) {
          cell.element.textContent = "💣";
        }
      });
    }
  }

  resetBtn.addEventListener("click", initGame);

  // Start initial game
  initGame();
});