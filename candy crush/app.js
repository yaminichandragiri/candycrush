const candies = ["Blue", "Orange", "Yellow", "Red", "Purple"];
const board = [];
const rows = 9;
const columns = 9;
let score = 0;
let curTile, otherTile;

window.onload = function () {
    startGame();
    window.setInterval(function () {
        crushCandy();
        slideCandy();
        generateCandy();
    }, 100);
};

function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)];
}

function startGame() {
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = `${r}-${c}`;
            tile.src = `./images/${randomCandy()}.png`;

            // Drag functionality
            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

function dragStart() {
    curTile = this;
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {}

function dragDrop() {
    otherTile = this;
}

function dragEnd() {
    if (curTile.src.includes("blank") || otherTile.src.includes("blank")) return;

    let currCoords = curTile.id.split("-");
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);
    let moveLeft = c2 == c - 1 && r == r2;
    let moveRight = c2 == c + 1 && r == r2;
    let moveUp = r2 == r - 1 && c == c2;
    let moveDown = r2 == r + 1 && c == c2;

    let isAdjacent = Math.abs(r - r2) + Math.abs(c - c2) === 1;

    if (isAdjacent) {
        let curImg = curTile.src;
        let otherImg = otherTile.src;
        curTile.src = otherImg;
        otherTile.src = curImg;

        let validMove = checkValid();
        if (!validMove) {
            curTile.src = curImg;
            otherTile.src = otherImg;
        }
        else {
            handleSpecialCandies(curTile, otherTile);
        }
    }
}
function handleSpecialCandies(tile1, tile2) {
    // If both tiles are Color Bombs
    if (tile1.src.includes("Choco.png") && tile2.src.includes("Choco.png")) {
        activateColorBomb(tile1.src);
        activateColorBomb(tile2.src);
    }
    // If one tile is Color Bomb
    else if (tile1.src.includes("Choco.png")) {
        activateColorBomb(tile2.src.split("/").pop().split(".")[0]);
    } else if (tile2.src.includes("Choco.png")) {
        activateColorBomb(tile1.src.split("/").pop().split(".")[0]);
    }
    // If one tile is striped candy
    else if (tile1.src.includes("Striped") || tile2.src.includes("Striped")) {
        if (tile1.src.includes("Striped")) {
            activateStripedCandy(parseInt(tile1.id.split("-")[0]), parseInt(tile1.id.split("-")[1]));
        }
        if (tile2.src.includes("Striped")) {
            activateStripedCandy(parseInt(tile2.id.split("-")[0]), parseInt(tile2.id.split("-")[1]));
        }
    }
}
function activateStripedCandy(row, col) {
    if (board[row][col].src.includes("Horizontal")) {
        for (let i = 0; i < columns; i++) {
            board[row][i].src = "./images/blank.png";
        }
    } else if (board[row][col].src.includes("Vertical")) {
        for (let i = 0; i < rows; i++) {
            board[i][col].src = "./images/blank.png";
        }
    }
    score += columns * 10;
}

function activateColorBomb(color) {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c].src.includes(color)) {
                board[r][c].src = "./images/blank.png";
                score += 10;
            }
        }
    }
}

function crushCandy() {
    let hasCrush = crushThree();
    if (hasCrush) {
        slideCandy();
        generateCandy();
    }
    document.getElementById("score").innerText = score;
}

function checkForMatches() {
    let hasCrush = false;

    // Check for matches
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let candy = board[r][c];
            if (candy.src.includes("blank")) continue;

            // Check horizontal match
            if (c < columns - 2) {
                let match = checkMatch(r, c, 0, 1);
                if (match.matched) {
                    hasCrush = true;
                    if (match.hasStriped) {
                        crushStripedCandy(r, c, true);
                    } else {
                        crushNormalCandy(r, c, match.count, true);
                    }
                }
            }

            // Check vertical match
            if (r < rows - 2) {
                let match = checkMatch(r, c, 1, 0);
                if (match.matched) {
                    hasCrush = true;
                    if (match.hasStriped) {
                        crushStripedCandy(r, c, false);
                    } else {
                        crushNormalCandy(r, c, match.count, false);
                    }
                }
            }
        }
    }

    return hasCrush;
}

function checkMatch(row, col, rowDelta, colDelta) {
    let candy1 = board[row][col];
    let candy2 = board[row + rowDelta][col + colDelta];
    let candy3 = board[row + 2 * rowDelta][col + 2 * colDelta];
    
    let count = 1;
    let hasStriped = candy1.src.includes("Striped");
    
    if (candy1.src.split("/").pop() === candy2.src.split("/").pop()) {
        count++;
        hasStriped = hasStriped || candy2.src.includes("Striped");
        if (candy2.src.split("/").pop() === candy3.src.split("/").pop()) {
            count++;
            hasStriped = hasStriped || candy3.src.includes("Striped");
        }
    }
    
    return {matched: count >= 3, count: count, hasStriped: hasStriped};
}



function crushThree() {
    let hasCrush = false;

    // Check rows
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];

            if (candy1.src.includes("blank")) continue;

            // Check for 5 in a row (create bomb candy)
            if (c < columns - 4 && candy1.src === candy2.src && candy2.src === candy3.src && candy3.src === board[r][c + 3].src && board[r][c + 3].src === board[r][c + 4].src) {
                let color = candy1.src.split("/").pop().split(".")[0];
                for (let i = 0; i < 5; i++) {
                    board[r][c + i].src = "./images/blank.png";
                }
                board[r][c + 2].src = `./images/${color}-Choco.png`; // Create a bomb candy in the middle
                score += 50;
                hasCrush = true;
            }
            // Check for 4 in a row (create striped candy)
            else if (c < columns - 3 && candy1.src === candy2.src && candy2.src === candy3.src && candy3.src === board[r][c + 3].src) {
                let color = candy1.src.split("/").pop().split(".")[0];
                for (let i = 0; i < 4; i++) {
                    board[r][c + i].src = "./images/blank.png";
                }
                let isHorizontal = Math.random() < 0.5;
                board[r][c].src = `./images/${color}-Striped-${isHorizontal ? 'Horizontal' : 'Vertical'}.png`;
                score += 40;
                hasCrush = true;
            }
            // 3 in a row (including striped candy)
            else if (candy1.src === candy2.src && candy2.src === candy3.src) {
                if (candy1.src.includes("Striped") || candy2.src.includes("Striped") || candy3.src.includes("Striped")) {
                    // Handle striped candy crush
                    hasCrush = true;
                    if (candy1.src.includes("Striped")) {
                        activateStripedCandy(parseInt(candy1.id.split("-")[0]), parseInt(candy1.id.split("-")[1]));
                    }
                    if (candy2.src.includes("Striped")) {
                        activateStripedCandy(parseInt(candy2.id.split("-")[0]), parseInt(candy2.id.split("-")[1]));
                    }
                    if (candy3.src.includes("Striped")) {
                        activateStripedCandy(parseInt(candy3.id.split("-")[0]), parseInt(candy3.id.split("-")[1]));
                    }
                } else {
                    hasCrush = crushNormal(r, c, 3, true);
                }
            }
        }
    }

    // Check columns
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];

            if (candy1.src.includes("blank")) continue;

            // Check for 5 in a column (create bomb candy)
            if (r < rows - 4 && candy1.src === candy2.src && candy2.src === candy3.src && candy3.src === board[r + 3][c].src && board[r + 3][c].src === board[r + 4][c].src) {
                let color = candy1.src.split("/").pop().split(".")[0];
                for (let i = 0; i < 5; i++) {
                    board[r + i][c].src = "./images/blank.png";
                }
                board[r + 2][c].src = `./images/Choco.png`; // Create a bomb candy in the middle
                score += 50;
                hasCrush = true;
            }
            // Check for 4 in a column (create striped candy)
            else if (r < rows - 3 && candy1.src === candy2.src && candy2.src === candy3.src && candy3.src === board[r + 3][c].src) {
                let color = candy1.src.split("/").pop().split(".")[0];
                for (let i = 0; i < 4; i++) {
                    board[r + i][c].src = "./images/blank.png";
                }
                let isHorizontal = Math.random() < 0.5;
                board[r][c].src = `./images/${color}-Striped-${isHorizontal ? 'Horizontal' : 'Vertical'}.png`;
                score += 40;
                hasCrush = true;
            }
            // 3 in a column (including striped candy)
            else if (candy1.src === candy2.src && candy2.src === candy3.src) {
                if (candy1.src.includes("Striped") || candy2.src.includes("Striped") || candy3.src.includes("Striped")) {
                    // Handle striped candy crush
                    hasCrush = true;
                    if (candy1.src.includes("Striped")) {
                        activateStripedCandy(parseInt(candy1.id.split("-")[0]), parseInt(candy1.id.split("-")[1]));
                    }
                    if (candy2.src.includes("Striped")) {
                        activateStripedCandy(parseInt(candy2.id.split("-")[0]), parseInt(candy2.id.split("-")[1]));
                    }
                    if (candy3.src.includes("Striped")) {
                        activateStripedCandy(parseInt(candy3.id.split("-")[0]), parseInt(candy3.id.split("-")[1]));
                    }
                } else {
                    hasCrush = crushNormal(r, c, 3, false);
                }
            }
        }
    }

    return hasCrush;
}




function crushStrippedIfPresent(row, col, count, isRow) {
    for (let i = 0; i < count; i++) {
        let candy = isRow ? board[row][col + i] : board[row + i][col];
        if (candy.src.includes("Striped")) {
            crushStrippedCandy(row, col, isRow);
            return true;
        }
    }
    return false;
}

function crushStrippedCandy(row, col, isRow) {
    let candy = board[row][col];
    let color = candy.src.split("/").pop().split("-")[0];
    let isHorizontal = candy.src.includes("Horizontal");

    if (isHorizontal) {
        for (let c = 0; c < columns; c++) {
            board[row][c].src = "./images/blank.png";
            score += 10;
        }
    } else {
        for (let r = 0; r < rows; r++) {
            board[r][col].src = "./images/blank.png";
            score += 10;
        }
    }
}

function crushColorBomb(row, col) {
    let colorBomb = board[row][col];
    let targetColor = "";

    // Find the first non-blank, non-Choco candy to determine the target color
    outerLoop:
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let candySrc = board[r][c].src;
            if (!candySrc.includes("blank") && !candySrc.includes("Choco")) {
                targetColor = candySrc.split("/").pop().split(".")[0];
                break outerLoop;
            }
        }
    }

    // Crush all candies of the target color
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let candySrc = board[r][c].src;
            if (candySrc.includes(targetColor)) {
                board[r][c].src = "./images/blank.png";
                score += 20;
            }
        }
    }

    colorBomb.src = "./images/blank.png";
}
function crushNormal(row, col, count, isRow) {
    for (let i = 0; i < count; i++) {
        if (isRow) {
            board[row][col + i].src = "./images/blank.png";
        } else {
            board[row + i][col].src = "./images/blank.png";
        }
    }
    score += 30;
    return true;
}

function checkValid() {
    // Check rows
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];
            if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                return true;
            }
        }
    }

    // Check columns
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];
            if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                return true;
            }
        }
    }

    return false;
}

function slideCandy() {
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                board[ind][c].src = board[r][c].src;
                ind -= 1;
            }
        }

        for (let r = ind; r >= 0; r--) {
            board[r][c].src = "./images/blank.png";
        }
    }
}

function generateCandy() {
    for (let c = 0; c < columns; c++) {
        if (board[0][c].src.includes("blank")) {
            board[0][c].src = `./images/${randomCandy()}.png`;
        }
    }
}
