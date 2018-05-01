var grid = [];
var gridWidth = 0;
var gridHeight = 0;

var popupEventElem = document.getElementById("popup-event");

var obstacleChar = '#';
var emptyChar = ',';
var playerChar = 'p';
var houseChar = 'H';

var playerPos = {x: 0, y: 0};

function initGrid(width, height) {
	gridWidth = width;
	gridHeight = height;
	for(var y = 0; y < gridHeight; y++) {
		grid.push([]);
		for(var x = 0; x < gridWidth; x++) {
			var chance = Math.random();
			if(chance < 0.01) {
				grid[y].push(houseChar);
			} else {
				grid[y].push(emptyChar);
			}
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

initGrid(100,40);
displayGrid();

// if player moves off the map, we put him back on
function playerBounds() {
	if(playerPos.x < 0) {
		playerPos.x = 0;
	}
	if(playerPos.y < 0) {
		playerPos.y = 0;
	}
	if(playerPos.x >= gridWidth) {
		playerPos.x = gridWidth - 1;
	}
	if(playerPos.y >= gridHeight) {
		playerPos.y = gridHeight - 1;
	}
}

function onPlayerMove() {
	playerBounds();
	if(grid[playerPos.y][playerPos.x] == houseChar) {
		popupEventElem.style.visibility = "visible";
	}
}

document.addEventListener("keydown", function(event) {
	if(popupEventElem.style.visibility == "visible") {
		return;
	}
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
	onPlayerMove();
	displayGrid();
});
