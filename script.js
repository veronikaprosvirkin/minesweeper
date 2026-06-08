//variables
let wdrData = [];
let gameState = [];
let minesPlaсed = 0;


//functions
function renderGameCells(cellBuilder, cellData) {
    if (cellData.type === "value" && cellData.rows && cellData.columns && cellData.rows.length > 0 && cellData.columns.length > 0) {
        let row = cellData.rows[0].caption;
        let col = cellData.columns[0].caption;
        cellBuilder.text = `<div class="cell hidden" data-r="${row}" data-c="${col}"></div>`;
    }
}

function placeMines() {
    while (minesPlaсed < 10) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (!gameState[r][c].isMine) {
            gameState[r][c].isMine = true;
            minesPlaсed++;
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


//data generation
for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
        wdrData.push({ "Row": "R" + i, "Column": "C" + j, "Value": 1 });
    }
}

for (let i = 0; i < 9; i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
       row.push({isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0});
    }
    gameState.push(row);
}

placeMines();


// game init
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
            grid: {
                showHeaders: false,     
                showGrandTotals: "off", 
                showTotals: "off"       
            }
        }
    },
    
});

