var grid = [];
var gridWidth = 0;
var gridHeight = 0;

var popupEventElem = document.getElementById("popup-event");
var popupEventTitleElem = document.getElementById("popup-event-title");
var popupEventButtonsElem = document.getElementById("popup-event-buttons");

var obstacleChar = '#';
var emptyChar = ',';
var playerChar = 'P';
var houseChar = 'H';
var enemyChar = 'E';
var bossChar = 'B';

var lastPlayerPos = {x: 0, y: 0};
var playerPos = {x: 0, y: 0};

function initStartingAreaGrid() {
	grid = [];
	gridWidth = 50;
	gridHeight = 25;
	// TODO: scale the text based on the width and height to fill the grid div
	// initialize everything to be an obstacle
	for(var y = 0; y < gridHeight; y++) {
		grid.push([]);
		for(var x = 0; x < gridWidth; x++) {
			grid[y].push(obstacleChar);
		}
	}
	playerPos.x = Math.floor(gridWidth / 2);
	playerPos.y = Math.floor(gridHeight / 2);
	lastPlayerPos.x = playerPos.x;
	lastPlayerPos.y = playerPos.y;

	// clear the player's position
	grid[playerPos.y][playerPos.x] = emptyChar;
	// make path to boss with 2 enemies along the way
	for(var y = playerPos.y - 1; y > playerPos.y - 5; y -= 2) {
		grid[y][playerPos.x] = emptyChar;
		grid[y - 1][playerPos.x] = enemyChar;
	}
	// make the path to the boss
	grid[y][playerPos.x] = emptyChar;
	grid[y - 1][playerPos.x] = bossChar;
}

function initGrid(width, height) {
	grid = [];
	gridWidth = width;
	gridHeight = height;
	// TODO: scale the text based on the width and height to fill the grid div
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
	playerPos.x = Math.floor(gridWidth / 2);
	playerPos.y = Math.floor(gridHeight / 2);
	lastPlayerPos.x = playerPos.x;
	lastPlayerPos.y = playerPos.y;
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

initStartingAreaGrid();
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
	if(grid[playerPos.y][playerPos.x] == obstacleChar) {
		playerPos.x = lastPlayerPos.x;
		playerPos.y = lastPlayerPos.y;
		return;
	}
	if(grid[playerPos.y][playerPos.x] == houseChar) {
		popupEventTitleElem.innerHTML = "House";
		popupEventElem.style.visibility = "visible";
	}
	if(grid[playerPos.y][playerPos.x] == enemyChar) {
		popupEventTitleElem.innerHTML = "Enemy Battle";
		popupEventElem.style.visibility = "visible";
		// TODO: battle buttons
	}
	if(grid[playerPos.y][playerPos.x] == bossChar) {
		popupEventTitleElem.innerHTML = "Boss Battle";
		popupEventElem.style.visibility = "visible";
		// TODO: upon dying to the boss, send them to the main world
	}
}

document.addEventListener("keydown", function(event) {
	if(popupEventElem.style.visibility == "visible") {
		// close if escape key pressed
		if(event.keyCode == 27) {
			popupEventElem.style.visibility = "hidden";
		}
		return;
	}
	// WASD or arrow key movement
	var moved = false;
	lastPlayerPos.x = playerPos.x;
	lastPlayerPos.y = playerPos.y;
	if(event.keyCode == 87 || event.keyCode == 38) {
		playerPos.y--;
		moved = true;
	}
	if(event.keyCode == 65 || event.keyCode == 37) {
		playerPos.x--;
		moved = true;
	}
	if(event.keyCode == 83 || event.keyCode == 40) {
		playerPos.y++;
		moved = true;
	}
	if(event.keyCode == 68 || event.keyCode == 39) {
		playerPos.x++;
		moved = true;
	}
	if(moved) {
		onPlayerMove();
		displayGrid();
	}
});

function closePopup() {
	popupEventElem.style.visibility = "hidden";
}
