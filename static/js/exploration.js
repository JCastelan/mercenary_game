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
var lootChar = 'L';
var bossChar = 'B';
var lootedChar = 'h'; //KRON wuz here
unexploredChar = 'u';

var lastPlayerPos = {x: 0, y: 0};
var playerPos = {x: 0, y: 0};

var playerViewLength = 4; // how many tiles out from their position can the player see

function clearCurrentTile() {
	grid[playerPos.y][playerPos.x].title = null;
	grid[playerPos.y][playerPos.x].desc = null;
	grid[playerPos.y][playerPos.x].buttons = null;
	grid[playerPos.y][playerPos.x].char = emptyChar;
}

function addToInventory(item) {
	if(!item.num) item.num = 1;
	// find the item in the inventory
	var found = false;
	for(var i = 0; i < APP.vue.band[0].inventory.length; i++) {
		if(APP.vue.band[0].inventory[i].name == item.name) {
			// if found, increment num of them
			APP.vue.band[0].inventory[i].num += item.num;
			found = true;
		}
	}
	if(!found) {
		// if not found, add it to the inventory
		APP.vue.band[0].inventory.push({
			name: item.name,
			damage: item.damage,
			num: item.num,
			is_weapon: item.is_weapon,
			is_armor: item.is_armor,
			health_boost: item.health_boost
		});
	}
}

function removeFromInventory(item) {
	if(!item.num) item.num = 1;
	// find the item in the inventory
	var found = false;
	for(var i = 0; i < APP.vue.band[0].inventory.length; i++) {
		if(APP.vue.band[0].inventory[i].name == item.name) {
			// if found, decrement num of them
			if(APP.vue.band[0].inventory[i].num > item.num) {
				APP.vue.band[0].inventory[i].num -= item.num;
			}
			else if(APP.vue.band[0].inventory[i].num == item.num) {
				APP.vue.band[0].inventory.splice(i, 1);
				return;
			}
			else {
				console.log("NOOOOOO");
				return;
			}
			found = true;
		}
	}
	if(!found) {
		// if not found, bad things happen
		console.log("NOOOOOO");
	}
}

function removeFromResources(resourceName, num) {
	if(!num) num = 1;
	for(var i = 0; i < APP.vue.resources.length; i++) {
		if(APP.vue.resources[i][0] == resourceName) {
			APP.vue.resources[i][1] -= num;
		}
	}
}

function getNumOfResource(resourceName) {
	if(APP.vue.resources == null) return 0;
	for(var i = 0; i < APP.vue.resources.length; i++) {
		if(APP.vue.resources[i][0] == resourceName) {
			return APP.vue.resources[i][1];
		}
	}
	return 0;
}

function addToResources(resourceName, num) {
	if(num == null) num = 1;
	for(var i = 0; i < APP.vue.resources.length; i++) {
		if(APP.vue.resources[i][0] == resourceName) {
			APP.vue.resources[i][1] += num;
		}
	}
}

function addRecruitToBand(name) {
	// APP.vue.band.push({
	// 	name: name,
	// 	health: 10,
	// 	max_health: 10,
	// 	weapon: {
	// 		name: "fists",
	// 		damage: 1
	// 	},
	// 	armor: {
	// 		name: "nothing",
	// 		health_boost: 0
	// 	}
	// });
	APP.vue.num_fighters[0]++;
	APP.vue.fighter_group_health[0] += 10;
}

function restartGame() {
	initStartingAreaGrid();
	displayGrid();
	APP.vue.band = [
		{ // index 0 is you
			name: "You",
			max_health: 10,
			health: 10,
			weapon: {
				name: "fists",
				damage: 1
			},
			armor: {
				name: "nothing",
				health_boost: 0
			},
			inventory: []
		} // any more is people you've recruited
	];
	APP.vue.in_battle = false;
}

function makeLootBag(bagY, bagX, items) {
	grid[bagY][bagX].char = lootChar;
	grid[bagY][bagX].title = "Loot Bag";
	grid[bagY][bagX].desc = "You conveniently found a loot bag with some goodies inside. Would you like to take some?";
	grid[bagY][bagX].buttons = [];
	for(var i = 0; i < items.length; i++) {
		// add buttons to the to-be popup event for taking each item
		grid[bagY][bagX].buttons.push(items[i]);
		grid[bagY][bagX].buttons[grid[bagY][bagX].buttons.length - 1].item_name = items[i].name;
		grid[bagY][bagX].buttons[grid[bagY][bagX].buttons.length - 1].name = "Take " + items[i].name;
		grid[bagY][bagX].buttons[grid[bagY][bagX].buttons.length - 1].onClick = function() {
			// auto equip weapon if it does more damage
			// if(this.is_weapon && APP.vue.band[0].weapon.damage < this.damage) {
			// 	APP.vue.band[0].weapon = {name: this.item_name, damage: this.damage, num: 1, is_weapon: true};
			// } else
			{ // otherwise add it to the inventory
				// check if we already have 1 of that item
				var found = false;
				for(var j = 0; j < APP.vue.band[0].inventory.length; j++) {
					if(APP.vue.band[0].inventory[j].name == this.item_name) {
						// if so, add to the quantity
						APP.vue.band[0].inventory[j].num++;
						found = true;
					}
				}
				// if we dont already have it, then add it
				if(!found) {
					APP.vue.band[0].inventory.push({
						name: this.item_name,
						damage: this.damage,
						num: 1,
						is_weapon: this.is_weapon,
						is_armor: this.is_armor,
						health_boost: this.health_boost
					});
				}
			}
			if(this.num > 1) {
				this.num--;
			}
			else {
				grid[playerPos.y][playerPos.x].buttons.splice(grid[playerPos.y][playerPos.x].buttons.indexOf(this), 1);
				if(grid[playerPos.y][playerPos.x].buttons.length == 0) {
					grid[playerPos.y][playerPos.x].desc = "Looted.";
					APP.vue.popup_desc = "Looted.";
					//-EDIT BY KRON: changes char to 'h' after a house has been looted-
					if (grid[playerPos.y][playerPos.x].char != null){
						grid[playerPos.y][playerPos.x].char = lootedChar;
					}
					else{
						clearCurrentTile(); 
					}
					//----------------------------------------------------------------
				}
			}
		};
	}
}

//--EDIT BY KRON: This Function is called to create loot bags--------------------
function spawnLootBag(x, y){
	grid[y][x].buttons = [
		{name: "Aye a loot bag", onClick: function() {
			makeLootBag(playerPos.y, playerPos.x, [
				{name: "iron sword", is_weapon: true, damage: 2, num: 1},
				{name: "food", num: 2},
				{name: "iron armor", is_armor: true, health_boost: 10, num: 1}
			]);
			APP.vue.popup_title = grid[playerPos.y][playerPos.x].title;
			APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
			APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
		}}];
}
//--------------------------------------------------------------------------------

function setVisibleToExplored() {
	for(var x = -playerViewLength; x <= playerViewLength; x++) {
		for(var y = -playerViewLength; y <= playerViewLength; y++) {
			grid[playerPos.y + y][playerPos.x + x].explored = true;
		}
	}
}

function initStartingAreaGrid() {
	grid = [];
	gridWidth = 50;
	gridHeight = 25;
	// TODO: scale the text based on the width and height to fill the grid div
	// initialize everything to be an obstacle
	for(var y = 0; y < gridHeight; y++) {
		grid.push([]);
		for(var x = 0; x < gridWidth; x++) {
			grid[y].push({char: obstacleChar, explored: false});
		}
	}
	playerPos.x = Math.floor(gridWidth / 2);
	playerPos.y = Math.floor(gridHeight / 2);
	lastPlayerPos.x = playerPos.x;
	lastPlayerPos.y = playerPos.y;
	setVisibleToExplored();

	// clear the player's position
	grid[playerPos.y][playerPos.x].char = emptyChar;
	// make path to boss with an iron sword and an enemy along the way
	grid[playerPos.y - 1][playerPos.x].char = emptyChar;

	makeLootBag(playerPos.y - 2, playerPos.x, [
		{name: "iron sword", is_weapon: true, damage: 2, num: 1},
		{name: "food", num: 1},
		{name: "leather armor", is_armor: true, health_boost: 5, num: 1}
	]);

	grid[playerPos.y - 3][playerPos.x].char = emptyChar;

	grid[playerPos.y - 4][playerPos.x].char = enemyChar;
	grid[playerPos.y - 4][playerPos.x].title = "1337 hacker boi";
	grid[playerPos.y - 4][playerPos.x].desc = "oi 1v1 m8 I\'ll rek u i swer on me mum";
	grid[playerPos.y - 4][playerPos.x].battle = true;
	grid[playerPos.y - 4][playerPos.x].damage = 1;
	grid[playerPos.y - 4][playerPos.x].cooldown = 60;
	grid[playerPos.y - 4][playerPos.x].onDeath = function() {
		grid[playerPos.y][playerPos.x].desc = "ur not too shabby m8, can I join u?";
		APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
		grid[playerPos.y][playerPos.x].buttons =  [
			{name: "Sure m8", onClick: function() {
				clearCurrentTile();
				addRecruitToBand("1337 hacker boi");
				APP.vue.show_popup = false;
			}},
			{name: "Nah man, I aint about that life", onClick: function() {
				APP.closePopup();
			}}
		];
		APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
	};
	// make the path to the boss
	grid[playerPos.y - 5][playerPos.x].char = emptyChar;
	grid[playerPos.y - 6][playerPos.x].char = bossChar;
	grid[playerPos.y - 6][playerPos.x].title = "Donovan";
	grid[playerPos.y - 6][playerPos.x].desc = "I\'m about to rick flair that ass. WOOOO!";
	grid[playerPos.y - 6][playerPos.x].battle = true;
	grid[playerPos.y - 6][playerPos.x].onDeath = function() {
		grid[playerPos.y][playerPos.x].title = "Victory!";
		grid[playerPos.y][playerPos.x].desc = "You defeated Donny.";
		grid[playerPos.y][playerPos.x].buttons = [
			{name: "Search body", onClick: function() {
				makeLootBag(playerPos.y, playerPos.x, [
					{name: "iron sword", is_weapon: true, damage: 2, num: 1},
					{name: "food", num: 2},
					{name: "iron armor", is_armor: true, health_boost: 10, num: 1}
				]);
				grid[playerPos.y][playerPos.x].buttons.push({name: "Go to hub world", onClick: function() {
					initHubWorldGrid(100, 40);
					displayGrid();
					APP.vue.show_popup = false;
				}});
				APP.vue.popup_title = grid[playerPos.y][playerPos.x].title;
				APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
				APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
			}},
			{name: "Go to hub world", onClick: function() {
				initHubWorldGrid(100, 40);
				displayGrid();
				APP.vue.show_popup = false;
			}}
		];
		APP.vue.popup_title = grid[playerPos.y][playerPos.x].title;
		APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
		APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
	};
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
				grid[y].push({char: houseChar, explored: false});
				//-EDIT BY KRON: Creates loot bags in random houses on Grid upon Hub Creation-
				var lootChance = Math.random();
				if (lootChance < .40) {
					spawnLootBag(x, y);
				}
				//--------------------------------------------------------------------------
			} else if(chance < 0.05) {
				// TODO: randomize the enemy names and stories
				// TODO: clear this tile onDeath
				grid[y].push({char: hiddenEnemyChar, battle: true, explored: false});
			} else {
				grid[y].push({char: emptyChar, explored: false});
			}
		}
	}
	playerPos.x = Math.floor(gridWidth / 2);
	playerPos.y = Math.floor(gridHeight / 2);
	lastPlayerPos.x = playerPos.x;
	lastPlayerPos.y = playerPos.y;
	setVisibleToExplored();
}

function displayGrid() {
	var gridElem = document.getElementById("grid");
	var gridString = "";
	for(var y = 0; y < gridHeight; y++) {
		for(var x = 0; x < gridWidth; x++) {
			if(!grid[y][x].explored) {
				gridString += unexploredChar;
			}
			else if(x == playerPos.x && y == playerPos.y) {
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
	setVisibleToExplored();

	// display generic defaults
	if(grid[playerPos.y][playerPos.x].char == houseChar) {
		APP.vue.popup_title = "House";
		APP.vue.popup_desc = "You\'ve encountered a generic house.";
		//--EDIT BY KRON: show buttons for House Loot Event--
		APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
		//--------------------------------------------------
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
		once = false; // used to make sure we call start_enemy_attacks once
		APP.vue.enemy_health = 10;
		once_again = false; // used to make sure we start an interval for player attacks once
		can_attacc = false;
		APP.vue.player_attack_time = 60;
		start_player_attacks();
		APP.vue.popup_buttons = [
			{name: "Attacc", onClick: function() {
				if(!can_attacc) return;
				can_attacc = false;
				APP.vue.player_attack_time = 0;
				var enemy_damage = 1;
				var enemy_cooldown = 60;
				if(grid[playerPos.y][playerPos.x].damage) {
					enemy_damage = grid[playerPos.y][playerPos.x].damage;
				}
				if(grid[playerPos.y][playerPos.x].cooldown) {
					enemy_cooldown = grid[playerPos.y][playerPos.x].cooldown;
				}
				start_enemy_attacks(enemy_damage, enemy_cooldown);
				var damage = 0;
				// this is for calculating damage based on the old recruiting system
				for(var i = 0; i < APP.vue.band.length; i++) {
					if(APP.vue.band[i].health > 0) { // TODO: keep this for resurrection if we do that
						damage += APP.vue.band[i].weapon.damage;
					}
				}
				// this is for calculating damage based on the new recruiting system
				for(var i = 0; i < APP.vue.num_fighters.length; i++) {
					damage += APP.vue.num_fighters[i] * (i+1);
				}
				APP.vue.enemy_health -= damage;
				if(APP.vue.enemy_health <= 0) {
					APP.vue.enemy_health = 0;
					grid[playerPos.y][playerPos.x].battle = false;
					APP.vue.in_battle = false;

					//EDIT BY KRON: Set a chance that there is a loot event
					// var lootCorpse = Math.random();
					// if (lootCorpse < 1){
					// 	spawnLootBag(playerPos.x,playerPos.y);
					// }
					//-----------------------------------------------------

					if(grid[playerPos.y][playerPos.x].onDeath) {
						grid[playerPos.y][playerPos.x].onDeath();
						return;
					}
					grid[playerPos.y][playerPos.x].desc = "You\'ve defeated this enemy";
					APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;

					grid[playerPos.y][playerPos.x].buttons = [];
					APP.vue.popup_buttons = [];
				}
			}}
		];
	}
}

var once_again = false;
var can_attacc = true;

function start_player_attacks() {
	if(once_again) return;
	once_again = true;

	limit_player_attacks();
}

function limit_player_attacks() {
	if(APP.vue.enemy_health <= 0) return;
	if(APP.vue.band[0].health <= 0) return;

	APP.vue.player_attack_time++;
	if(!can_attacc && document.getElementsByClassName("option_buttons").length > 0) {
		document.getElementsByClassName("option_buttons")[0].style.opacity = APP.vue.player_attack_time / 60;
	}
	if(APP.vue.player_attack_time > 60) {
		can_attacc = true;
	}

	requestAnimationFrame(limit_player_attacks);
}

var enemy_attack_ticks = 0;
var enemy_attack_cooldown_ticks = 0;
var enemy_damage = 1;
var cur_band_member_being_attacked = 0;
var once = false;

function start_enemy_attacks(damage, cooldown) {
	if(once) return;
	once = true;
	enemy_attack_ticks = 0;
	enemy_attack_cooldown_ticks = cooldown;
	enemy_damage = damage;
	// for(var i = APP.vue.band.length - 1; i >= 0; i--) {
	// 	if(APP.vue.band[i].health > 0) {
	// 		cur_band_member_being_attacked = i;
	// 		break;
	// 	}
	// }
	cur_band_member_being_attacked = -1;
	for(var i = 0; i < APP.vue.num_fighters.length; i++) {
		if(APP.vue.num_fighters[i] != 0) {
			cur_band_member_being_attacked = i;
			break;
		}
	}
	simulate_enemy_attacks();
}

// TODO: resurrection, but you have to get a negative stat every time you revive a band member
	// for now we'll just have perma death

function simulate_enemy_attacks() {
	enemy_attack_ticks++;
	if(APP.vue.enemy_health == 0) return;
	if(enemy_attack_ticks % enemy_attack_cooldown_ticks == 0) {
		var i = cur_band_member_being_attacked;
		// APP.vue.band[cur_band_member_being_attacked].health -= enemy_damage;
		// if(APP.vue.band[cur_band_member_being_attacked].health <= 0) {
		// 	cur_band_member_being_attacked--;
		// 	if(cur_band_member_being_attacked == -1) {
		// 		APP.vue.popup_title = "You died!";
		// 		APP.vue.popup_desc = "u ded boyo";
		// 		APP.vue.popup_buttons = [
		// 			{name: "Revive", onClick: function() {
		// 				restartGame();
		// 				APP.vue.show_popup = false;
		// 			}}
		// 		];
		// 		return;
		// 	}
		// 	APP.vue.band.splice(APP.vue.band.length - 1, 1);
		// }

		// below is for updated recuiting
		if(i == -1) {
			APP.vue.band[0].health -= enemy_damage;
			if(APP.vue.band[0].health <= 0) {
				APP.vue.band[0].health = 0;
				APP.vue.popup_title = "You died!";
				APP.vue.popup_desc = "u ded boyo";
				APP.vue.popup_buttons = [
					{name: "Revive", onClick: function() {
						restartGame();
						APP.vue.show_popup = false;
					}}
				];
				return;
			}
		}
		else {
			var old_num_alive_fighers = Math.ceil(APP.vue.fighter_group_health[i] / APP.vue.health_per_figher[i]);
			APP.vue.fighter_group_health[i] -= enemy_damage;
			console.log("fgh: " + APP.vue.fighter_group_health[i]);
			var new_num_alive_fighers = Math.ceil(APP.vue.fighter_group_health[i] / APP.vue.health_per_figher[i]);
			console.log("nnaf: " + new_num_alive_fighers);
			if(new_num_alive_fighers != old_num_alive_fighers) {
				// a figher died, decrement num_fighers
				APP.vue.num_fighters[i]--;
			}
			if(APP.vue.fighter_group_health[i] <= 0) {
				APP.vue.fighter_group_health[i] = 0;
				cur_band_member_being_attacked--;
			}
			APP.vue.$forceUpdate();
		}
	}
	requestAnimationFrame(simulate_enemy_attacks);
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
