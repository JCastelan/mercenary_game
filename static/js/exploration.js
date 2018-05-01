var grid = [];
var gridWidth = 0;
var gridHeight = 0;

var obstacleChar = '#';
var emptyChar = ',';
var playerChar = 'p';

var playerPos = {x: 0, y: 0};

function initGrid(width, height) {
	gridWidth = width;
	gridHeight = height;
	for(var y = 0; y < gridHeight; y++) {
		grid.push([]);
		for(var x = 0; x < gridWidth; x++) {
			grid[y].push(emptyChar);
		}
	}
	playerPos.x = gridWidth / 2;
	playerPos.y = gridHeight / 2;
}

function displayGrid() {
	var gridElem = document.getElementById("grid");
	var gridString = "";
	for(var y = 0; y < gridHeight; y++) {
		for(var x = 0; x < gridWidth; x++) {
			if(x == playerPos.x && y == playerPos.y) {
				gridString += playerChar;
			} else {
				gridString += grid[y][x];
			}
		}
		gridString += "<br>";
	}
	gridElem.innerHTML = gridString;
}

initGrid(30,10);
displayGrid();

document.addEventListener("keydown", function(event) {
	if(event.keyCode == 87 || event.keyCode == 38) {
		playerPos.y--;
	}
	if(event.keyCode == 65 || event.keyCode == 37) {
		playerPos.x--;
	}
	if(event.keyCode == 83 || event.keyCode == 40) {
		playerPos.y++;
	}
	if(event.keyCode == 68 || event.keyCode == 39) {
		playerPos.x++;
	}
	displayGrid();
});
