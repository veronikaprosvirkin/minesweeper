//variables
let wdrData = [];
let gameState = [];
let minesPlaced = 0;
let isFirstClick = true;
let timerInterval = null;
let timeElapsed = 0;
let flagsPlaced = 0;
let isGameOver = false;

//functions
function placeMines(startR, startC) {
    while (minesPlaced < 10) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        
        if (Math.abs(r - startR) <= 1 && Math.abs(c - startC) <= 1) {
            continue; //safe zone around first click
        }

        if (!gameState[r][c].isMine) {
            gameState[r][c].isMine = true;
            minesPlaced++;
        }
    }
}

function countNeighborMines() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (gameState[r][c].isMine) {
                continue;
            }
            
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr;
                    let nc = c + dc;
                    
                    if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                        if (gameState[nr][nc].isMine) {
                            count++;
                        }
                    }
                }
            }
            gameState[r][c].neighborMines = count;
        }
    }
}

function revealCell(r, c) {
    if (r < 0 || r >= 9 || c < 0 || c >= 9 || gameState[r][c].isRevealed) {
        return;
    }

    gameState[r][c].isRevealed = true;
    if (gameState[r][c].neighborMines === 0 && !gameState[r][c].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                revealCell(r + dr, c + dc);
            }
        }
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        let minutes = Math.floor(timeElapsed / 60);
        let seconds = timeElapsed % 60;
        document.getElementById("timer").textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function restartGame() {
    stopTimer();
    timeElapsed = 0;
    document.getElementById("timer").textContent = "00:00";

    flagsPlaced = 0;
    minesPlaced = 0;
    isFirstClick = true;
    document.getElementById("mines-counter").textContent = "10";
    document.getElementById("smiley-btn").textContent = "😊";

    gameState = []; 
    for (let i = 0; i < 9; i++) {
        let row = [];
        for (let j = 0; j < 9; j++) {
           row.push({isMine: false, isRevealed: false, isFlagged: false, isQuestioned: false, neighborMines: 0});
        }
        gameState.push(row);
    }
    isGameOver = false;
    pivot.refresh();
}

function checkWin() {
    let revealedCount = 0;

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let cell = gameState[r][c];
            if (!cell.isMine && cell.isRevealed) {
                revealedCount++;
            }
        }
    }

    if (revealedCount === 71) { // 81 total - 10 mines
        document.getElementById("smiley-btn").textContent = "😎";
        alert("Congratulations! You won!");
        isGameOver = true;
        stopTimer();
    }
}

function revealAllOnLoss() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (gameState[r][c].isMine && !gameState[r][c].isFlagged) {
                gameState[r][c].isRevealed = true;
            }
            else if (!gameState[r][c].isMine && gameState[r][c].isFlagged) {
                gameState[r][c].isMistake = true; //for styling incorrect flags
            }
        }
    }
}

//view function
function renderGameCells(cellBuilder, cellData) {
    if (cellData.type === "value" && cellData.rows && cellData.columns && cellData.rows.length > 0 && cellData.columns.length > 0) {
        
        let row = parseInt(cellData.rows[0].caption.substring(1));
        let col = parseInt(cellData.columns[0].caption.substring(1));

        let cell = gameState[row][col];

        if (cell.isRevealed) {
            let content = "";
            let colorClass = "";

            if (cell.isMine) {
                content = "💣";
            } else if (cell.neighborMines > 0) {
                content = cell.neighborMines;
                colorClass = `val-${cell.neighborMines}`;
            }
            
            cellBuilder.text = `<div class="cell revealed ${colorClass}" data-r="${row}" data-c="${col}">${content}</div>`;
        } else {
            if (cell.isMistake) {
                cellBuilder.text = `<div class="cell hidden mistake" data-r="${row}" data-c="${col}">❌</div>`;
            } else if (cell.isFlagged) {
                cellBuilder.text = `<div class="cell hidden flagged" data-r="${row}" data-c="${col}">🚩</div>`;
            } else if (cell.isQuestioned) {
                cellBuilder.text = `<div class="cell hidden questioned" data-r="${row}" data-c="${col}">❓</div>`;
            } else {
                cellBuilder.text = `<div class="cell hidden" data-r="${row}" data-c="${col}"></div>`;
            }
        }
    }
}


for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
        wdrData.push({ "Row": "R" + i, "Column": "C" + j, "Value": 1 });
    }
}

//matrix initialization
for (let i = 0; i < 9; i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
       row.push({isMine: false, isRevealed: false, isFlagged: false, isQuestioned: false, neighborMines: 0});
    }
    gameState.push(row);
}


//webdatarocks initialization
let pivot = new WebDataRocks({
    container: "#wdr-component",
    customizeCell: renderGameCells,
    toolbar: false, 
    report: {
        dataSource: { data: wdrData },
        slice: { 
            rows: [{ uniqueName: "Row" }],
            columns: [{ uniqueName: "Column" }],
            measures: [{ uniqueName: "Value"}] 
        },
        options: {
            drillThrough: false, 
            grid: {
                showHeaders: false,
                showGrandTotals: "off",
                showTotals: "off",
                showSelection: false
            }
        }
    }
});

//event listener
document.getElementById("wdr-component").addEventListener("click", function(event) {
    if (isGameOver) {
        return;
    }

    if (event.target.classList.contains("cell") && event.target.classList.contains("hidden")) {
        let r = parseInt(event.target.getAttribute("data-r"));
        let c = parseInt(event.target.getAttribute("data-c"));
        let cell = gameState[r][c];

        if (cell.isFlagged || cell.isQuestioned) {
            return;
        }

        if (isFirstClick) {
            isFirstClick = false;
            startTimer();
            placeMines(r, c);
            countNeighborMines();
        }

        revealCell(r, c);
        checkWin();

        if (gameState[r][c].isMine) {
            document.getElementById("smiley-btn").textContent = "😵";
            revealAllOnLoss();
            alert("Game Over!");
            stopTimer();
            isGameOver = true;
        }

        pivot.refresh();
    }
    
    else if (event.target.classList.contains("cell") && event.target.classList.contains("revealed")) {
        let r = parseInt(event.target.getAttribute("data-r"));
        let c = parseInt(event.target.getAttribute("data-c"));
        let cell = gameState[r][c];

        if (cell.neighborMines > 0) {
            let flagsAround = 0;

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr;
                    let nc = c + dc;
                    if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                        if (gameState[nr][nc].isFlagged) {
                            flagsAround++;
                        }
                    }
                }
            }

            if (flagsAround === cell.neighborMines) {
                let hitMine = false;

                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        let nr = r + dr;
                        let nc = c + dc;
                        if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                            let neighbor = gameState[nr][nc];
                            
                            if (!neighbor.isRevealed && !neighbor.isFlagged) {
                                revealCell(nr, nc);
                                
                                if (neighbor.isMine) {
                                    hitMine = true;
                                }
                            }
                        }
                    }
                }

                if (hitMine) {
                    document.getElementById("smiley-btn").textContent = "😵";
                    revealAllOnLoss();
                    alert("Game Over!");
                    stopTimer();
                    isGameOver = true;
                } else {
                    checkWin();
                }

                pivot.refresh();
            }
        }
    }
});

document.getElementById("wdr-component").addEventListener("contextmenu", function(event) {
    event.preventDefault();
    if (isGameOver) {
        return;
    }
    if (event.target.classList.contains("cell") && event.target.classList.contains("hidden")) {
        let r = parseInt(event.target.getAttribute("data-r"));
        let c = parseInt(event.target.getAttribute("data-c"));
        let cell = gameState[r][c];
        
        if (!cell.isFlagged && !cell.isQuestioned) {
            cell.isFlagged = true;
            flagsPlaced++;
            document.getElementById("mines-counter").textContent = (10 - flagsPlaced).toString();
        } else if (cell.isFlagged && !cell.isQuestioned) {
            cell.isFlagged = false;
            cell.isQuestioned = true;
            flagsPlaced--;
            document.getElementById("mines-counter").textContent = (10 - flagsPlaced).toString();
        } else if (!cell.isFlagged && cell.isQuestioned) {
            cell.isQuestioned = false;
        }
        pivot.refresh();
    }
});

document.getElementById("smiley-btn").addEventListener("click", restartGame);