var grid = [];
var gridWidth = 0;
var gridHeight = 0;

var popupEventElem = document.getElementById("popup-event");
var popupEventTitleElem = document.getElementById("popup-event-title");
var popupEventDescElem = document.getElementById("popup-event-desc");
var popupEventButtonsElem = document.getElementById("popup-event-buttons");

var obstacleChar = '#';
var emptyChar = ',';
var playerChar = 'P';
var houseChar = 'H';
var enemyChar = 'E';
var hiddenEnemyChar = 'Q';
var itemChar = 'I';
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
			grid[y].push({char: obstacleChar});
		}
	}
	playerPos.x = Math.floor(gridWidth / 2);
	playerPos.y = Math.floor(gridHeight / 2);
	lastPlayerPos.x = playerPos.x;
	lastPlayerPos.y = playerPos.y;

	// clear the player's position
	grid[playerPos.y][playerPos.x].char = emptyChar;
	// make path to boss with an iron sword and an enemy along the way
	grid[playerPos.y - 1][playerPos.x].char = emptyChar;
	
	grid[playerPos.y - 2][playerPos.x].char = itemChar;
	grid[playerPos.y - 2][playerPos.x].title = "Iron Sword";
	grid[playerPos.y - 2][playerPos.x].desc = "You found an iron sword on the ground. Would you like to pick it up?";
	grid[playerPos.y - 2][playerPos.x].buttons = [
		{name: "(1) Pick Up", onClick: function(){
			APP.vue.inventory.weapon = "iron sword";
			grid[playerPos.y][playerPos.x].desc = "You picked up the iron sword.";
			APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
			grid[playerPos.y][playerPos.x].buttons = [];
			APP.vue.popup_buttons = [];
		}},
		{name: "(2) Leave it", onClick: function(){
			APP.closePopup();
		}}
	];

	grid[playerPos.y - 3][playerPos.x].char = emptyChar;

	grid[playerPos.y - 4][playerPos.x].char = enemyChar;
	grid[playerPos.y - 4][playerPos.x].title = "1337 hacker boi";
	grid[playerPos.y - 4][playerPos.x].desc = "oi 1v1 m8 I\'ll rek u i swer on me mum";
	grid[playerPos.y - 4][playerPos.x].battle = true;
	// make the path to the boss
	grid[playerPos.y - 5][playerPos.x].char = emptyChar;
	grid[playerPos.y - 6][playerPos.x].char = bossChar;
	grid[playerPos.y - 6][playerPos.x].battle = true;
}

function initHubWorldGrid(width, height) {
	grid = [];
	gridWidth = width;
	gridHeight = height;
	// TODO: scale the text based on the width and height to fill the grid div
	for(var y = 0; y < gridHeight; y++) {
		grid.push([]);
		for(var x = 0; x < gridWidth; x++) {
			var chance = Math.random();
			if(chance < 0.01) {
				grid[y].push({char: houseChar});
			} else if(chance < 0.05) {
				grid[y].push({char: hiddenEnemyChar, battle: true});
			} else {
				grid[y].push({char: emptyChar});
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
			} else if(grid[y][x].char == hiddenEnemyChar) {
				gridString += emptyChar;
			} else {
				gridString += grid[y][x].char;
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
	if(grid[playerPos.y][playerPos.x].char == obstacleChar) {
		playerPos.x = lastPlayerPos.x;
		playerPos.y = lastPlayerPos.y;
		return;
	}

	// display generic defaults
	if(grid[playerPos.y][playerPos.x].char == houseChar) {
		APP.vue.popup_title = "House";
		APP.vue.popup_desc = "You\'ve encountered a generic house.";
		APP.vue.show_popup = true;
	}
	if(grid[playerPos.y][playerPos.x].char == enemyChar) {
		APP.vue.popup_title = "Enemy Battle";
		APP.vue.popup_desc = "You\'ve encountered a generic enemy battle.";
		APP.vue.show_popup = true;
	}
	if(grid[playerPos.y][playerPos.x].char == hiddenEnemyChar) {
		APP.vue.popup_title = "Hidden Enemy Battle";
		APP.vue.popup_desc = "You\'ve encountered a generic hidden enemy battle.";
		APP.vue.show_popup = true;
	}
	if(grid[playerPos.y][playerPos.x].char == bossChar) {
		APP.vue.popup_title = "Boss Battle";
		APP.vue.popup_desc = "You\'ve encountered a generic boss battle.";
		APP.vue.show_popup = true;
	}

	// if there are specific details specified on the grid space, set the popup to display those
	APP.vue.popup_buttons = [];
	if(grid[playerPos.y][playerPos.x].buttons) {
		APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
		APP.vue.show_popup = true;
	}
	if(grid[playerPos.y][playerPos.x].title) {
		APP.vue.popup_title = grid[playerPos.y][playerPos.x].title;
		APP.vue.show_popup = true;
	}
	if(grid[playerPos.y][playerPos.x].desc) {
		APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
		APP.vue.show_popup = true;
	}

	// spawn battle buttons
	if(grid[playerPos.y][playerPos.x].battle) {
		APP.vue.in_battle = true;
		APP.vue.player_health = 10;
		APP.vue.enemy_health = 10;
		APP.vue.popup_buttons = [
			{name: "(1) Attacc", onClick: function() {
				// TODO: add cooldowns to yours and your enemies' attacks
				if(APP.vue.inventory.weapon == "fists") {
					APP.vue.enemy_health--;
				}
				if(APP.vue.inventory.weapon == "iron sword") {
					APP.vue.enemy_health -= 2;
				}
				if(APP.vue.enemy_health <= 0) {
					APP.vue.enemy_health = 0;

					grid[playerPos.y][playerPos.x].desc = "You\'ve defeated this enemy";
					APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;

					grid[playerPos.y][playerPos.x].buttons = [];
					APP.vue.popup_buttons = [];

					grid[playerPos.y][playerPos.x].battle = false;
					APP.vue.in_battle = false;
				}
			}}
		];
	}
}

document.addEventListener("keydown", function(event) {
	if(APP.vue.show_popup) {
		// close if escape key pressed
		if(event.keyCode == 27) {
			APP.closePopup();
		}
		// let number keys work as clicking on popup event buttons
		if(event.keyCode >= 49 && event.keyCode <= 57) {
			// we pressed a number between 1 and 9 (1 being keyCode 49)
			if(APP.vue.popup_buttons.length > 0 && event.keyCode - 49 < APP.vue.popup_buttons.length) {
				APP.vue.popup_buttons[event.keyCode - 49].onClick();
			}
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
