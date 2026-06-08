
console.log("Скрипт завантажено успішно!");


let wdrData = [];
for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
        wdrData.push({ "Row": "R" + i, "Column": "C" + j, "Value": 1 });
    }
}

function renderGameCells(cellBuilder, cellData) {
    if (cellData.type === "value" && cellData.rows && cellData.columns && cellData.rows.length > 0 && cellData.columns.length > 0) {
        let row = cellData.rows[0].caption;
        let col = cellData.columns[0].caption;
        cellBuilder.text = `<div class="cell hidden" data-r="${row}" data-c="${col}"></div>`;
    }
}

let gameState = [];
for (let i = 0; i < 9; i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
       row.push({isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0});
    }
    gameState.push(row);
}

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

