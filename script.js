solveBtn = document.getElementById("solveBtn");

const grid = [
    [0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 0, 0, 1, 1]
];

const shapes = [
    
    [
        [0, 0], [0, 1], [1, 0], [1, 1] //O shape
    ],
    [
        [0, 0], [1, 0], [2, 0], [3, 0] //I shape
    ],
    [
         [0, 0], [0, 1], [0, 2], [1, 1] //T shape
    ]

]

//solve button click logic
solveBtn.addEventListener("click", () => {
    const solved = solve(grid, shapes);
    
    if (!solved) {
        console.log("No solution found");
        console.table(grid);
    }
    else {
        console.log("Solved");
        console.table(grid);
    }
})

//main recursive algorithm
function solve(grid, shapes, placements = [])
{
    if (isSolved(grid)) {
        console.log("solved");
        console.table(grid);
        return true;
    }

    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {
            if (grid[x][y] !== 0) continue;

            for (let shapeIndex = 0; shapeIndex < shapes.length; shapeIndex++) {
                const shape = shapes[shapeIndex];

                if (canPlace(grid, shape, x, y)) {
                    placeShape(grid, shape, x, y, shapeIndex + 2);
                    placements.push({shapeIndex, x, y});

                    if (solve(grid, shapes, placements)) return true;

                    placeShape(grid, shape, x, y, 0);
                    placements.pop();
                }
            }
        }
    }
    console.table(grid);
    return false;
}

//checks shapes for valid placements
function canPlace(grid, shape, x, y)
{
    for (let [dx, dy] of shape) {
        let nx = x + dx;
        let ny = y + dy;
        if (nx < 0 || ny < 0 ||
            nx >= grid.length || ny >= grid[0].length ||
            grid[nx][ny] !== 0) {

                return false;
            }
    }
    return true; //exited for loop so placement is valid
}

//check every cell for empty space. if all cells are filled, return true.
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