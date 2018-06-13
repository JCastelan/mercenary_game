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
var lootedChar = 'H';  //"Ugly but functional..." -KRON 6/12/18
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

function getWeaponDamageByName(name) {
	if(name == "fists") return 1;
	if(name == "wooden sword") return 2;
	if(name == "iron sword") return 3;
	if(name == "steel sword") return 4;
	if(name == "mithril sword") return 5;
}

function getArmorHealthBoostByName(name) {
	if(name == "nothing") return 0;
	if(name == "leather armor") return 5;
	if(name == "iron armor") return 10;
	if(name == "steel armor") return 15;
	if(name == "mithril armor") return 20;
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
			if(APP.vue.band[0].inventory[i].num >= item.num) {
				APP.vue.band[0].inventory[i].num -= item.num;
			}
			// else if(APP.vue.band[0].inventory[i].num == item.num) {
			// 	APP.vue.band[0].inventory.splice(i, 1);
			// 	return;
			// }
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
	initHubWorldGrid(100, 40);
	displayGrid();
	APP.vue.band[0].max_health = 10;
	APP.vue.band[0].health = 10;
	APP.vue.band[0].weapon.name = "fists";
	APP.vue.band[0].weapon.damage = 1;
	APP.vue.band[0].armor.name = "nothing";
	APP.vue.band[0].armor.health_boost = 0;

	for(var i = 0; i < APP.vue.band[0].inventory.length; i++) {
		APP.vue.band[0].inventory[i].num = 0;
	}
	for(var i = 0; i < APP.vue.resources.length; i++) {
		APP.vue.resources[i][1] = 0;
	}

	APP.vue.num_fighters = [0, 0, 0, 0, 0]; // each element is a different level of fighter
	APP.vue.fighter_group_health = [0, 0, 0, 0, 0];
	
	APP.vue.available_villagers = 0;
	APP.vue.wood_gatherer = 0;
	APP.vue.hunter = 0;
	APP.vue.coal_miner = 0;
	APP.vue.iron_miner = 0;
	APP.vue.mithril_miner = 0;
	APP.vue.coal_mine_unlocked = false;
	APP.vue.iron_mine_unlocked = false;
	APP.vue.mithril_mine_unlocked = false;
	APP.vue.in_battle = false;
	APP.saveResources();
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
				if(this.item_name == "food" || this.item_name.includes("sword") || this.item_name.includes("armor")) {
					for(var j = 0; j < APP.vue.band[0].inventory.length; j++) {
						if(APP.vue.band[0].inventory[j].name == this.item_name) {
							APP.vue.band[0].inventory[j].num++;
						}
					}
				}
				else {
					// check if we already have 1 of that item
					// var found = false;
					for(var j = 0; j < APP.vue.resources.length; j++) {
						if(APP.vue.resources[j][0] == this.item_name) {
							// if so, add to the quantity
							APP.vue.resources[j][1]++;
							// found = true;
						}
					}
					// // if we dont already have it, then add it
					// if(!found) {
					// 	APP.vue.band[0].inventory.push({
					// 		name: this.item_name,
					// 		damage: this.damage,
					// 		num: 1,
					// 		is_weapon: this.is_weapon,
					// 		is_armor: this.is_armor,
					// 		health_boost: this.health_boost
					// 	});
					// }
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

					grid[playerPos.y][playerPos.x].char = grid[playerPos.y][playerPos.x].oldChar;
					//-EDIT BY KRON: changes char to 'h' after a house has been looted-
					// if (oldChar == houseChar){
					// 	grid[playerPos.y][playerPos.x].char = lootedChar;
					// } else if (oldChar == hiddenEnemyChar){
					// 	grid[playerPos.y][playerPos.x].char = emptyChar;
					// }else if (oldChar == lootChar){
					// 	 grid[playerPos.y][playerPos.x].char = lootedChar;
					// }else{
					// 	clearCurrentTile();
					// }
					//----------------------------------------------------------------
				}
			}
		};
	}
}

//--EDIT BY KRON: This Function is called to create loot bags--------------------
function spawnLootBag(y, x ){
	// TODO: Adust function so that the bag loots items based on probability
	/* Probability of obtaining resources from loot bags
	*	Resource     %
	*	________________
	*	mithril 	.01
	*	steel 		.10
	*	iron 		.10
	*	leather 	.16
	*	coal 		.21
	*	wood 		.21
	*	food 		.21
	*/

	var resourceList = ["mithril","steel","iron","leather","coal", "wood", "food"];
	var loot = [];

	var num1 = Math.round(Math.random() * 4 + 1);
	var num2 = Math.round(Math.random() * 4 + 1);
	var num3 = Math.round(Math.random() * 4 + 1);
	
	for ( i = 0; i < 3; i++){
		randomResource = Math.random();
		if (randomResource < .01){
			loot[i] = resourceList[0]; 
		}else if (randomResource >= 0.01 && randomResource < .11){
			loot[i] = resourceList[1]; 
		}else if (randomResource >= 0.11 && randomResource < .21){
			loot[i] = resourceList[2]; 
		}else if (randomResource >= 0.21 && randomResource < .37){
			loot[i] = resourceList[3];
		}else if (randomResource >= 0.37 && randomResource < .58){
			loot[i] = resourceList[4];
		}else if (randomResource >= 0.58 && randomResource < .79){
			loot[i] = resourceList[5];
		}else{
			loot[i] = resourceList[6];
		}
	}

	
	grid[y][x].buttons = [
		{name: "Aye a loot bag", onClick: function() {
			grid[playerPos.y][playerPos.x].oldChar = grid[playerPos.y][playerPos.x].char;
			makeLootBag(playerPos.y, playerPos.x,  [
				{name: loot[0], num: num1},
				{name: loot[1], num: num2},
				{name: loot[2], num: num3}
			]);

			console.log(JSON.stringify(grid[playerPos.y][playerPos.x].char));

			APP.vue.popup_title = grid[playerPos.y][playerPos.x].title;
			APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
			APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
		}}];

}
//--------------------------------------------------------------------------------

function setVisibleToExplored() {
	for(var x = -playerViewLength; x <= playerViewLength; x++) {
		for(var y = -playerViewLength; y <= playerViewLength; y++) {
			if(playerPos.y + y >= 0 && playerPos.y + y < gridHeight
			&& playerPos.x + x >= 0 && playerPos.x + x < gridWidth) {
				grid[playerPos.y + y][playerPos.x + x].explored = true;
			}
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
		{name: "iron sword", is_weapon: true, damage: 3, num: 1},
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
					{name: "iron sword", is_weapon: true, damage: 3, num: 1},
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
					spawnLootBag(y, x);
				}
				else if (lootChance <=.80){
					grid[y][x].battle = true;
					grid[y][x].onDeath = function() {		
						console.log("let the bodies hit the floor");
						var lootCorpse = Math.random();
						if (lootCorpse < .50){
							spawnLootBag(playerPos.y, playerPos.x);

							APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
							APP.vue.show_popup = true;	
						} else{						
							grid[playerPos.y][playerPos.x].buttons = [];
							APP.vue.popup_buttons = [];

							grid[playerPos.y][playerPos.x].desc = "You\'ve defeated this enemy";
							APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
							APP.vue.show_popup = true;
						}
					};

				}
				else if(lootChance < .9) {
					grid[y][x].desc = "You meet a friendly stranger. He greets you and welcomes you into his home. After a talk over a meal, he talks about his dream to become a mercenary. He asks if he can join you.";
					grid[y][x].buttons = [
						{name: "Yes", onClick: function() {
							clearCurrentTile();
							addRecruitToBand();
							APP.closePopup();
						}},
						{name: "No", onClick: function() {
							grid[playerPos.y][playerPos.x].desc = "The now familiar stranger greets you again and puts forth his previous offer to join your band of mercenaries";
							grid[playerPos.y][playerPos.x].buttons = [
								{name: "Yes", onClick: function() {
									addRecruitToBand();
								}},
								{name: "No", onClick: function() {
									APP.closePopup();
								}}
							];
							APP.closePopup();
						}}
					];
				}
				//--------------------------------------------------------------------------
			} else if(chance < 0.05) {
				// TODO: randomize the enemy names and stories
				// TODO: clear this tile onDeath
				grid[y].push({char: hiddenEnemyChar, battle: true, explored: false});
				//-EDIT BY KRON: hiddenLoot Chance-------------------------------
				grid[y][x].onDeath =function(){
					console.log("let the hidden bodies hit the floor");		
					var hiddenLoot = Math.random();
					if (hiddenLoot < .50){
						spawnLootBag(playerPos.y, playerPos.x);
						APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
						APP.vue.show_popup = true;	
					}
					else {
						APP.vue.popup_buttons = [];
					}
				}
				//--------------------------------------------------------------
			} else {
				grid[y].push({char: emptyChar, explored: false});

			}
		}
	}
	// final boss fight
	grid[0][0].char = 'b';
	grid[0][0].title = "The Storm Crows";
	grid[0][0].desc = "The night was silent. Cold air blows upon your skin. There in the clearing lies the noble’s child tied and gagged. Surrounding the child was the storm crows armed and ready for your arrival. In front of them was the leader Maximus Gluteus. The hulking beast towered a foot over his men. 'Child you have made a grave mistake challenging the Storm Crows. If this is where you wish to end, I will oblige you with the honor of falling to my blade. Come! Brace yourself!'";
	grid[0][0].buttons = [
		{name: "Fight!", onClick: function() {
			grid[0][0].battle = true;
			grid[0][0].damage = 20;
			grid[0][0].cooldown = 30;
			grid[0][0].health = 100;
			grid[0][0].desc = "Both sides rush towards each other. Blades in hand and bloodlust in the air.";
			grid[0][0].onDeath = function() {
				APP.vue.popup_desc = "'Finish me..'";
				APP.vue.popup_buttons = [
					{name: "Execute", onClick: function() {
						APP.vue.popup_desc = "You bring your blade down upon him. *Silence*. You stood there wondering of what have ensued. Could this be your fate one day? Suddenly a smell reach your nose. The guy defecated himself. 'Haha nah bruh. I’ll never poop in my pants when I die.'";
						APP.vue.popup_buttons = [
							{name: "Continue", onClick: function() {
								APP.vue.popup_desc = "You win! https://www.youtube.com/watch?v=1Bix44C1EzY\nThanks for playing our game!";
								APP.vue.popup_buttons = [
									{name: "Restart", onClick: function() {
										restartGame();
									}}
								];
							}}
						];
					}}
				];
			};
			onPlayerMove();
		}}
	];
	//Starting point
	 APP.vue.popup_title ="Beginnings";
	 APP.vue.popup_desc = "3 days ago the noble house Lancaster was hit by an unfortunate event. Their only child Victor Lancaster was kidnapped during the night " +
		 "by a mysterious group. A call was then sent out to the people of Midland. Anyone who is able to bring back the child unharmed will be greatly rewarded with " +
		 "gold and ranking. You know you're close. Maybe people around here know something.";
	 APP.vue.popup_buttons = [
		{name: "Onwards!", onClick: function() {
			clearCurrentTile();
			APP.vue.show_popup = false;
		}},
	 ];
	 APP.vue.show_popup = true;

	playerPos.x = Math.floor(gridWidth / 2);
	playerPos.y = Math.floor(gridHeight / 2);
	lastPlayerPos.x = playerPos.x;
	lastPlayerPos.y = playerPos.y;
	setVisibleToExplored();

	// make iron mine
	grid[playerPos.y-3][playerPos.x-3].char = "I";
	grid[playerPos.y-3][playerPos.x-3].title = "Iron Mine";
	grid[playerPos.y-3][playerPos.x-3].desc = "You found the iron mine!";
	grid[playerPos.y-3][playerPos.x-3].buttons = [
		{name: "Unlock iron ore mining", onClick: function() {
			APP.vue.iron_mine_unlocked = true;
			grid[playerPos.y][playerPos.x].desc = "You already unlocked this mine. You can assign villagers to mine from here.";
			grid[playerPos.y][playerPos.x].buttons = [];
			APP.closePopup();
		}}
	];

	// make coal mine
	grid[playerPos.y+10][playerPos.x+6].char = "C";
	grid[playerPos.y+10][playerPos.x+6].title = "Coal Mine";
	grid[playerPos.y+10][playerPos.x+6].desc = "You found the coal mine!";
	grid[playerPos.y+10][playerPos.x+6].buttons = [
		{name: "Unlock coal mining", onClick: function() {
			APP.vue.coal_mine_unlocked = true;
			grid[playerPos.y][playerPos.x].desc = "You already unlocked this mine. You can assign villagers to mine from here.";
			grid[playerPos.y][playerPos.x].buttons = [];
			APP.closePopup();
		}}
	];

	// make mithril mine
	grid[playerPos.y+15][playerPos.x-30].char = "M";
	grid[playerPos.y+15][playerPos.x-30].title = "Mithril Mine";
	grid[playerPos.y+15][playerPos.x-30].desc = "You found the mithril mine!";
	grid[playerPos.y+15][playerPos.x-30].buttons = [
		{name: "Unlock mithril mining", onClick: function() {
			APP.vue.mithril_mine_unlocked = true;
			grid[playerPos.y][playerPos.x].desc = "You already unlocked this mine. You can assign villagers to mine from here.";
			grid[playerPos.y][playerPos.x].buttons = [];
			APP.closePopup();
		}}
	];

	//Cheeky bugger at farmville
	grid[playerPos.y][playerPos.x+3].char = houseChar;
	grid[playerPos.y][playerPos.x+3].title = "Cheeky bugger at Farmville";
	grid[playerPos.y][playerPos.x+3].desc = "A burning farm stands before you. You then hear a laugh from a man holding a wine bottle. Well butcher's hook wha' we 'ave 'ere. A cheeky bugger who doesn'' knah 'ah 'er keep 'heir hooter aaah' ov uvver " +
		"people's business.";
	grid[playerPos.y][playerPos.x+3].damage = 1;
	grid[playerPos.y][playerPos.x+3].health = 4;
	grid[playerPos.y][playerPos.x+3].buttons =  [
		{name: "What?", onClick: function() {
			grid[playerPos.y][playerPos.x].battle=true;
			onPlayerMove();
		}},
		{name: "Time to rekt this boi ", onClick: function() {
			grid[playerPos.y][playerPos.x].battle=true;
			onPlayerMove();
		}}
	];
	grid[playerPos.y][playerPos.x+3].onDeath = function() {
		APP.vue.popup_desc  = "Damn.. my gu's are ou' ov my body..'his suck. A farmer approached thanking you and tells you that their were more of " +
			"them heading north with a child";
		APP.vue.popup_buttons = [
			{name: "Search body", onClick: function() {
				grid[playerPos.y][playerPos.x].oldChar = grid[playerPos.y][playerPos.x].char;
				makeLootBag(playerPos.y, playerPos.x, [
					{name: "iron sword", is_weapon: true, damage: 2, num: 1},
					{name: "food", num: 2},
					{name: "iron armor", is_armor: true, health_boost: 10, num: 1}
				]);
				APP.vue.popup_title = grid[playerPos.y][playerPos.x].title;
				APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
				APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
			}},
		];

	};

	//Sad Toshi
	grid[playerPos.y + 6][playerPos.x - 3].char = houseChar;
	grid[playerPos.y + 6][playerPos.x - 3].title = "Sad Toshi (つ﹏<)";
	grid[playerPos.y + 6][playerPos.x - 3].desc = "You come upon a man sitting alone at a bench.*Sniff* *Sniff*, ohh it’s all my fault";
	grid[playerPos.y + 6][playerPos.x - 3].damage = 1;
	grid[playerPos.y + 6][playerPos.x - 3].health = 8;
	grid[playerPos.y + 6][playerPos.x - 3].buttons =  [
		{name: "Comfort the fella", onClick: function() {
				APP.vue.popup_desc  = "Thanks man I needed that. Toshi joins your squaaa"
				APP.vue.popup_buttons = [
					{name: "High five Toshi and keep movin", onClick: function() {
						clearCurrentTile();
						addRecruitToBand("Sad Toshi (つ﹏<)");
						APP.vue.show_popup = false;
					}},
				];
		}},
		{name: "I’mma make his life worse (☞ﾟヮﾟ)☞", onClick: function() {
			grid[playerPos.y][playerPos.x].battle=true;
			onPlayerMove();
		}}
	];
	grid[playerPos.y + 6][playerPos.x - 3].onDeath = function() {
		APP.vue.popup_desc  = "You smacked him around and made him ran away. You felt kind of a dick";
		APP.vue.popup_buttons = [
			{name: "Let's get out of here", onClick: function() {
				clearCurrentTile();
				APP.vue.show_popup = false;
			}},
		];

	};

	//Granny with the candy
	grid[playerPos.y + 7][playerPos.x+1].char = houseChar;
	grid[playerPos.y + 7][playerPos.x+1].title = "Granny with the candy";
	grid[playerPos.y + 7][playerPos.x+1].desc = "You are invited to a candy made house.You look like you need some candy child";
	grid[playerPos.y + 7][playerPos.x+1].damage = 2;
	grid[playerPos.y + 7][playerPos.x+1].health = 5;
	grid[playerPos.y + 7][playerPos.x+1].buttons =  [
		{name: "Eat candy", onClick: function() {
			APP.vue.band[0].health -= 2;
			if(APP.vue.band[0].health <= 0){
				APP.vue.popup_desc  = "You gobbled them candy like a little pudgy fat kid. Ohh you feel lightheaded and all went black";
				APP.vue.popup_buttons = [
					{name: "Pretty sure your dead", onClick: function() {
						clearCurrentTile();
						APP.vue.show_popup = false;
					}},
				];
				restartGame()
			}
		}},
		{name: "It’s clobberin time!", onClick: function() {
			grid[playerPos.y][playerPos.x].battle=true;
			onPlayerMove();
		}}
	];
	grid[playerPos.y + 7][playerPos.x+1].onDeath = function() {
		APP.vue.popup_desc  = "Uh.. Help I have fallen and I can’t get up";
		APP.vue.popup_buttons = [
			{name: "Grab her wooden cane and pie", onClick: function() {
				grid[playerPos.y][playerPos.x].oldChar = grid[playerPos.y][playerPos.x].char;
				makeLootBag(playerPos.y, playerPos.x, [
					{name: "wooden sword", is_weapon: true, damage: 2, num: 1},
					{name: "food", num: 1},
				]);
				APP.vue.popup_title = grid[playerPos.y][playerPos.x].title;
				APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
				APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
			}},
		];

	};

	//Nerdy Boyo
	grid[playerPos.y + 2][playerPos.x + 2].char = houseChar;
	grid[playerPos.y + 2][playerPos.x + 2].title = "Nerdy Boyo";
	grid[playerPos.y + 2][playerPos.x + 2].desc = "You come upon a boi picking up cards off the floor. The boi looks disheveled and grim. He looks up and sees you." +
		" Immediately he ran towards you. “Halp me please! This bully has taken my blue eyes! If you find him and teach him a lesson I’ll give you a great weapon" +
		" grand warrior! ";
	grid[playerPos.y + 2][playerPos.x + 2].damage = 1;
	grid[playerPos.y + 2][playerPos.x + 2].health = 2;
	grid[playerPos.y + 2][playerPos.x + 2].buttons =  [
		{name: "Find the bully", onClick: function() {
			APP.vue.popup_desc  = "You found the brat and gave the sucka a suplex. Card retrieved. Good sir! You have save the realm from this evil tyrant. " +
				"May this weapon help you on your adventure.";
				APP.vue.popup_buttons = [
					{name: "Got 1 steel sword and 2 juicy twinkies ʕ ∗ •́ ڡ •̀ ∗ ʔ", onClick: function() {
						makeLootBag(playerPos.y, playerPos.x, [
							{name: "steel sword", is_weapon: true, damage: 4, num: 1},
							{name: "food", num: 2},
						]);
						APP.vue.popup_title = grid[playerPos.y][playerPos.x].title;
						APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
						APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
					}},
				];
		}},
		{name: "Grab his remaining cards and rip them.Rob the boyo.", onClick: function() {
			grid[playerPos.y][playerPos.x].battle=true;
			onPlayerMove();
		}}
	];
	grid[playerPos.y + 2][playerPos.x + 2].onDeath = function() {
		APP.vue.popup_desc  = "The poor kid grovelled under your feet as you laugh maniacally";
				APP.vue.popup_buttons = [
					{name: "Rob the punk's twinkies", onClick: function() {
						makeLootBag(playerPos.y, playerPos.x, [
							{name: "food", num: 3},
						]);
						APP.vue.popup_title = grid[playerPos.y][playerPos.x].title;
						APP.vue.popup_desc = grid[playerPos.y][playerPos.x].desc;
						APP.vue.popup_buttons = grid[playerPos.y][playerPos.x].buttons;
					}},
				];

	};
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

// initStartingAreaGrid();
// initHubWorldGrid(100, 40);
// displayGrid();

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
	var enemy_health_multiplier = 3;

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

		//--EDIT BY KRON: show buttons for House Loot Event--
		if (grid[playerPos.y][playerPos.x].battle == true){
			APP.vue.popup_desc = "Oh no its a house goblin!";
		}
		else{
			APP.vue.popup_desc = "You\'ve encountered a generic house.";
			grid[playerPos.y][playerPos.x].char = lootedChar;
		}
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
		enemy_health_multiplier=5
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
		var damage = 0; //moved this to current location so we could use it to calculate an appropriate enemy health
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

		APP.vue.enemy_health = damage*enemy_health_multiplier + Math.floor(Math.random() * (damage/2));;

		if(grid[playerPos.y][playerPos.x].health > APP.vue.enemy_health) { 
			APP.vue.enemy_health = grid[playerPos.y][playerPos.x].health;
		}
		once_again = false; // used to make sure we start an interval for player attacks once
		can_attacc = false;
		APP.vue.player_attack_time = 60;
		start_player_attacks();
		APP.vue.popup_buttons = [
			{name: "Attacc", onClick: function() {
				if(!can_attacc) return;
				can_attacc = false;
				APP.vue.player_attack_time = 0;
				var enemy_damage = 1;//Math.floor(APP.vue.band[0].max_health/11);
				var enemy_cooldown = 60;
				if(grid[playerPos.y][playerPos.x].damage) {
					enemy_damage = grid[playerPos.y][playerPos.x].damage;
				}


				if(grid[playerPos.y][playerPos.x].cooldown) {
					enemy_cooldown = grid[playerPos.y][playerPos.x].cooldown;
				}
				start_enemy_attacks(enemy_damage, enemy_cooldown);
				APP.vue.enemy_health -= damage;
				if(APP.vue.enemy_health <= 0) {
					APP.vue.enemy_health = 0;
					grid[playerPos.y][playerPos.x].battle = false;
					APP.vue.in_battle = false;

					//EDIT BY KRON: Set a chance that there is a loot event
					console.log(JSON.stringify (grid[playerPos.y][playerPos.x]));
					if(grid[playerPos.y][playerPos.x].onDeath) {
						console.log("r the bodies hitting the floor?");		
						grid[playerPos.y][playerPos.x].onDeath();
						return;
					}
					//----------------------------------------------------------
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
//var enemy_damage = 1;
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
	if(APP.vue.enemy_health == 0){
		APP.vue.enemies_defeated++;
		console.log(APP.vue.enemies_defeated);
		return;
	}
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
						document.getElementsByClassName("option_buttons")[0].style.opacity = 1;
						restartGame();
						APP.vue.show_popup = false;
					}}
				];
				return;
			}
		}
		else {
			var old_num_alive_fighters = Math.ceil(APP.vue.fighter_group_health[i] / APP.vue.health_per_fighter[i]);
			APP.vue.fighter_group_health[i] -= enemy_damage;
			// console.log("fgh: " + APP.vue.fighter_group_health[i]);
			var new_num_alive_fighters = Math.ceil(APP.vue.fighter_group_health[i] / APP.vue.health_per_fighter[i]);
			// console.log("nnaf: " + new_num_alive_fighters);
			if(new_num_alive_fighters != old_num_alive_fighters) {
				// a fighter died, decrement num_fighters
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
