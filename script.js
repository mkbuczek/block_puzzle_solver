const solveBtn = document.getElementById("solveBtn");
const rowInput = document.getElementById("rows");
const colInput = document.getElementById("cols");
const gridContainer = document.getElementById("gridContainer");
const solutionGridContainer = document.getElementById("solutionGridContainer");
const editShapeGrid = document.getElementById("editShapeGrid");

const grid = [];
const shapeGrid = [];
const allSolutions = [];
const uniqueSolutions = new Set();
const shapes = [];
const shapeCount = [];
const shapeColors = [
    "red",       // shape 2
    "blue",      // shape 3
    "green",     // shape 4
    "orange",    // shape 5
    "purple",    // shape 6
    "cyan",      // shape 7
    "pink",      // shape 8
    "yellow",    // shape 9
    "lime",      // shape 10
];
const shapeColorIndices = [];
var colorIndex = 0;
let allowRotations = false;

//shuffle color array for random shape colors!
shapeColors.sort(() => Math.random() - 0.5);

//default display grid is 5x5
renderInputGrid(5, 5);
//render shape creation grid
renderShapeGrid()

//solve button click logic
solveBtn.addEventListener("click", () => {
    //clear previous solutions
    uniqueSolutions.clear();
    allSolutions.length = 0;

    //does not solve on default grid
    const empty = findFirstEmpty(grid);
    if (!empty) {
        alert("No empty space in grid");
        return;
    }

    const tempGrid = grid.map(row => [...row]);
    const tempUsage = Array(shapes.length).fill(0);

    //DEBUG
    // console.log("Solving grid:");
    // console.table(grid);
    // console.log("Shapes:", shapes);
    // console.log("Shape counts:", shapeCount);

    //call solve function to check for a solution
    solve(tempGrid, shapes, [], tempUsage, shapeCount);

    //no solution
    if (allSolutions.length === 0) {
        alert("No solution found");
    }
    //solution found! renders the solution grid
    else {
        console.log(`Found ${allSolutions.length} solution(s)`);
        renderAllSolutions(allSolutions, parseInt(rowInput.value), parseInt(colInput.value));
    }
})

//main recursive algorithm
function solve(grid, shapes, placements = [], usage = Array(shapes.length).fill(0), shapeCount) {
    if (isSolved(grid)) {
        //check shape usage
        for (let i = 0; i < shapeCount.length; i++) {
            if (usage[i] !== shapeCount[i]) return false;
        }

        const solvedCopy = grid.map(row => [...row]);
        const solutionKey = solvedCopy.map(row => row.join(',')).join('|');

        if (!uniqueSolutions.has(solutionKey)) {
            uniqueSolutions.add(solutionKey);
            allSolutions.push(solvedCopy);
        }
        return false; //continue looking
    }

    const firstEmpty = findFirstEmpty(grid);
    if (!firstEmpty) return false;

    const [x, y] = firstEmpty;
    console.log(`👉 Trying first empty cell at (${x}, ${y})`); //DEBUG

    for (let shapeIndex = 0; shapeIndex < shapes.length; shapeIndex++) {
        if (usage[shapeIndex] >= shapeCount[shapeIndex]) continue;

        const shape = shapes[shapeIndex];
        console.log(`🌀 Trying shape ${shapeIndex} coords:`, shape); //DEBUG

        if (canPlace(grid, shape, x, y)) {
            console.log(`🔥 Placing shape ${shapeIndex} at (${x}, ${y})`); //DEBUG
            placeShape(grid, shape, x, y, shapeIndex + 2);
            usage[shapeIndex]++;
            placements.push({ shapeIndex, x, y });

            if (solve(grid, shapes, placements, usage, shapeCount)) return true;

            //backtrack
            placeShape(grid, shape, x, y, 0);
            usage[shapeIndex]--;
            placements.pop();
            console.log(`🔙 Backtracking shape ${shapeIndex} from (${x}, ${y})`); //DEBUG
        }
    }

    return false;
}

//checks shapes for valid placements within the grid without overlapping
function canPlace(grid, shape, x, y, rot = null) {
    for (let [dx, dy] of shape) {
        let nx = x + dx;
        let ny = y + dy;
        //check bounds and if cell is empty (0)
        if (nx < 0 || ny < 0 || nx >= grid.length || ny >= grid[0].length || grid[nx][ny] !== 0) {
            console.log(`❌ Can't place shape at (${x},${y}), rotation ${rot} — blocked at (${nx},${ny})`); //DEBUG
            return false;
        }
    }
    return true;
}

//check every cell for empty space. if all cells are filled, return true
function isSolved(grid)
{
    for (let row of grid) {
        for (let cell of row) {
            if (cell === 0) return false;
        }
    }
    return true;
}

//"move" each piece to each valid location
function placeShape(grid, shape, x, y, val)
{
    for (let [dx, dy] of shape) {
        grid[x + dx][y + dy] = val;
    }
}
//find the next empty cell
function findFirstEmpty(grid) {
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === 0) return [r, c];
        }
    }
    return null;
}

//render the input grid dynamically based on row/col input
function renderInputGrid(rows, cols) {

    solutionGridContainer.innerHTML = "";
    solutionGridContainer.style.display = "none";

    gridContainer.innerHTML = "";
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    //reset grid
    grid.length = 0;
    for (let r = 0; r < rows; r++) {
        grid.push(new Array(cols).fill(0));
    }

    //loop through each cell, add an event listener for clicking
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-cell");
            cell.style.backgroundColor = "white"
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener("click", () => {
                //toggle between 0 and 1
                grid[r][c] = grid[r][c] === 0 ? 1 : 0;
                cell.style.backgroundColor = grid[r][c] === 1 ? "gray" : "white";
                console.log(`grid[${r}][${c}] = ${grid[r][c]}`); //DEBUG
            });

            gridContainer.appendChild(cell);
        }
    }
}

//event listeners to render the input grid based on entries
rowInput.addEventListener("input", () => {
    const rows = clamp(rowInput.value, 1, 20);
    const cols = clamp(colInput.value, 1, 20);
    renderInputGrid(rows, cols);
});
colInput.addEventListener("input", () => {
    const rows = clamp(rowInput.value, 1, 20);
    const cols = clamp(colInput.value, 1, 20);
    renderInputGrid(rows, cols);
});

//helper function for min/max row/col entries
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, parseInt(val) || min));
}

//render allSolutions array
function renderAllSolutions(solutions, rows, cols) {
    solutionGridContainer.innerHTML = "";
    solutionGridContainer.style.display = "flex";

    //loop through each solution
    solutions.forEach((solution, index) => {
        //wrapper for solution # and grid
        const wrapper = document.createElement("div");
        wrapper.classList.add("solution-wrapper");
        wrapper.innerHTML = `<div class="gridTitle">Solution ${index + 1} </div>`;

        //creates each unique solution grid
        const grid = document.createElement("div");
        grid.classList.add("solution-grid");
        grid.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

        //loop through and creates each solution grid cell, assigns colors
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement("div");
                cell.classList.add("solution-grid-cell");
                const val = solution[r][c];

                if (val === 0) {
                    cell.style.backgroundColor = "white";
                } else if (val === 1) {
                    cell.style.backgroundColor = "gray";
                } else {
                    const colorIndex = shapeColorIndices[val - 2];
                    const color = shapeColors[colorIndex % shapeColors.length];
                    cell.style.backgroundColor = color;
                }

                grid.appendChild(cell);
            }
        }

        wrapper.appendChild(grid);
        solutionGridContainer.appendChild(wrapper);
    });
}

//similar to renderInputGrid; renders the shape grid cells for user input
function renderShapeGrid() {
    
    for (let r = 0; r < 4; r++) {
        shapeGrid.push(new Array(4).fill(0));
    }
    //loop through each cell, add an event listener for clicking
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-cell");
            cell.style.backgroundColor = "white";

            cell.addEventListener("click", () => {
                shapeGrid[r][c] = shapeGrid[r][c] === 0 ? 1 : 0;
                
                //dynamically fetch current color
                const dynamicColor = shapeColors[colorIndex % shapeColors.length];
                cell.style.backgroundColor = shapeGrid[r][c] === 1 ? dynamicColor : "white";
                console.log(`grid[${r}][${c}] = ${grid[r][c]}`); //DEBUG
            });

            editShapeGrid.appendChild(cell);
        }
    }
}

//adds user input shape and shapeCount to arrays for solving
function addShape() {
    //return if empty
    if (shapeGrid.every(row => row.every(cell => cell === 0))) {
        alert("Shape is empty");
        return;
    }

    //take shape count from user input
    const count = parseInt(document.getElementById("editShapeCount").value);
    //get coords from shapeGrid
    const coords = shapeGridToCoords(shapeGrid);

    if (!isShapeConnected(coords)) {
        alert("Shape is not connected!");
        return;
    }

    //push to arrays
    shapeCount.push(count);
    shapes.push(coords.map(([r,c]) => [r,c]));
    //assign the colors and render the shape list
    shapeColorIndices.push(colorIndex);
    renderShapeList(shapes, shapeCount);
    colorIndex++;

    const cells = editShapeGrid.querySelectorAll(".grid-cell");

    let cellIndex = 0;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            shapeGrid[r][c] = 0;
            cells[cellIndex].style.backgroundColor = "white";
            cellIndex++;
        }
    }
}

//helper function to check if added shape is all connected
function isShapeConnected(coords) {
    if (coords.length === 0) return false;

    //BFS from first cell
    const visited = new Set();
    const queue = [coords[0]];
    visited.add(coords[0].toString());

    const coordSet = new Set(coords.map(c => c.toString()));
    const directions = [
        [1, 0],[-1, 0],[0, 1],[0, -1]
    ];

    //visit neighbors to find connected pieces
    while (queue.length > 0) {
        const [r,c] = queue.shift();

        for (const [dr,dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            const neighbor = [nr,nc].toString();

            if (coordSet.has(neighbor) && !visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([nr,nc]);
            }
        }
    }
    //if the amount of visited cells is the same as the amount of coord cells, true!
    return visited.size === coords.length;
}

//helper function to convert shapeGrid to coords format
function shapeGridToCoords(grid) {
    const coords = [];

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === 1) {
                coords.push([r,c]);
            }
        }
    }

    if (coords.length === 0) return [];

    let anchor = coords.reduce((best, curr) => {
        let [br, bc] = best;
        let [cr, cc] = curr;
        if (cr < br || (cr === br && cc < bc)) return curr;
        return best;
    });

    const [minR, minC] = anchor;
    const normalized = coords.map(([r, c]) => [r - minR, c - minC]);
    return normalized;
}

//renders the shapes array onto the shape list container
function renderShapeList(shapes, shapeCount) {
    const container = document.getElementById("shapeList");
    container.innerHTML = "";

    shapes.forEach((shape, index) => {
        //outer wrapper to hold both the shape and the count
        const outerWrapper = document.createElement("div");
        outerWrapper.classList.add("shapeWrapperContainer");

        //shape grid wrapper
        const shapeWrapper = document.createElement("div");
        shapeWrapper.classList.add("shape");
        shapeWrapper.style.position = "relative";

        const maxR = Math.max(...shape.map(([r]) => r));
        const maxC = Math.max(...shape.map(([_, c]) => c));

        shapeWrapper.style.width = `${(maxC + 1) * 30}px`;
        shapeWrapper.style.height = `${(maxR + 1) * 30}px`;

        //generate each filled cell
        shape.forEach(([r, c]) => {
            //assign colors, create cells
            const colorIndex = shapeColorIndices[index];
            const color = shapeColors[colorIndex % shapeColors.length];
            const cell = document.createElement("div");
            cell.classList.add("solution-grid-cell");
            cell.style.position = "absolute";
            cell.style.left = `${c * 30}px`;
            cell.style.top = `${r * 30}px`;
            cell.style.backgroundColor = color;

            shapeWrapper.appendChild(cell);
        });

        //count display
        const countText = document.createElement("div");
        countText.classList.add("shapeCountText");
        countText.style.textAlign = "center";
        countText.textContent = `Count: ${shapeCount[index]}`;
        //deleteBtn display
        const deleteBtn = document.createElement("div");
        deleteBtn.classList.add("deleteBtn");
        deleteBtn.innerHTML = "Delete";
        //deleteBtn clickdetector
        deleteBtn.addEventListener("click", () => {
            shapes.splice(index, 1);
            shapeCount.splice(index, 1);
            shapeColorIndices.splice(index, 1);
            renderShapeList(shapes, shapeCount);
        });

        outerWrapper.appendChild(shapeWrapper);
        outerWrapper.appendChild(countText);
        outerWrapper.appendChild(deleteBtn);
        container.appendChild(outerWrapper);
    });
}

//clears the shapes and renders a blank shapeList
function clearShapes() {
    //return if no shapes
    if (shapes.length === 0) {
        alert("No shapes to clear");
        return;
    }
    //clear arrays
    shapes.length = 0;
    shapeCount.length = 0;
    shapeColorIndices.length = 0;
    renderShapeList(shapes, shapeCount);
}