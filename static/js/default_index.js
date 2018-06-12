// This is the js for the default/index.html view.

//the generic counter is used for debugging purposes
var app = function() {
    var self = {};
    Vue.config.silent = false; // show all warnings
    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
	};

	self.closePopup = function() {
		if(self.vue.in_battle && self.vue.enemy_health > 0) return;
		self.vue.show_popup = false;
	};
	
	self.get_band_health = function() {
		var health = 0;
		// this for is from the old way of recruiting
		for(var i = 0; i < self.vue.band.length; i++) {
			health += self.vue.band[i].health;
		}
		// this for is from the new way of recruiting
		for(var i = 0; i < self.vue.fighter_group_health.length; i++) {
			health += self.vue.fighter_group_health[i];
		}
		return health;
	};
	
    switch_tab = function(id){
        activated_color = 'yellow';
        ids = ["b_res", "b_village", "b_party", "b_crafting"];
        ids.forEach(function(d){
			if(document.getElementById(d) != null) {
				if( d == id){
					document.getElementById(d).classList.add(activated_color);
				}else{
					document.getElementById(d).classList.remove(activated_color);
				}
			}
        });

    }
    activated_color = 'yellow';
	self.show_view_panel_resources = function() {
        switch_tab("b_res");
		self.vue.viewing_resources = true;
		self.vue.viewing_party = false;
		self.vue.viewing_village = false;
		self.vue.viewing_crafting = false;
	};

	self.show_view_panel_party = function() {
        switch_tab("b_party");
		self.vue.viewing_resources = false;
		self.vue.viewing_party = true;
		self.vue.viewing_village = false;
		self.vue.viewing_crafting = false;
	};

	self.show_view_panel_village = function() {
        switch_tab("b_village");
		self.vue.viewing_resources = false;
		self.vue.viewing_party = false;
		self.vue.viewing_village = true;
		self.vue.viewing_crafting = false;
	};

	self.show_view_panel_crafting = function() {
        switch_tab("b_crafting");
		self.vue.viewing_resources = false;
		self.vue.viewing_party = false;
		self.vue.viewing_village = false;
		self.vue.viewing_crafting = true;
	};

	self.can_eat_food = function(member) {
		if(member.health >= member.max_health) return false; // cant heal if full health
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].name == "food" && self.vue.band[0].inventory[i].num > 0) {
				return true;
			}
		}
		return false;
	};

	self.eat_food = function(member) {
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].name == "food" && self.vue.band[0].inventory[i].num > 0) {
				member.health += 5;
				if(member.health > member.max_health) {
					member.health = member.max_health;
				}
				if(self.vue.band[0].inventory[i].num > 1) {
					self.vue.band[0].inventory[i].num--;
				}
				else {
					self.vue.band[0].inventory.splice(i, 1);
				}
				return;
			}
		}
	};

	self.can_equip_weapon = function(member) {
		if(!self.vue) return false;
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].is_weapon && self.vue.band[0].inventory[i].damage > member.weapon.damage) {
				return true;
			}
		}
		return false;
	};

	self.equip_weapon = function(member) {
		// TODO: open up a popup for equipping weapons
			// make sure this doesn't conflict with other popups
		// first find the best weapon
		var best_weapon_index = -1;
		var best_weapon_damage = 0;
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].is_weapon && self.vue.band[0].inventory[i].damage > member.weapon.damage
			&& best_weapon_damage < self.vue.band[0].inventory[i].damage) {
				best_weapon_index = i;
				best_weapon_damage = self.vue.band[0].inventory[i].damage;
			}
		}
		if(best_weapon_index == -1) {
			return;
		}
		// add back our current weapon to the inventory if we have a current weapon other than fists
		if(member.weapon.name != "fists") {
			self.unequip_weapon(member);
		}
		// set the weapon to the new weapon
		member.weapon = {
			name: self.vue.band[0].inventory[best_weapon_index].name,
			is_weapon: self.vue.band[0].inventory[best_weapon_index].is_weapon,
			damage: self.vue.band[0].inventory[best_weapon_index].damage
		};
		// remove that weapon from the inventory
		if(self.vue.band[0].inventory[best_weapon_index].num > 1) {
			self.vue.band[0].inventory[best_weapon_index].num--;
		}
		else {
			self.vue.band[0].inventory.splice(best_weapon_index, 1);
		}
	};

	self.unequip_weapon = function(member) {
		if(member.weapon.name == "fists") {
			console.log("NOOOOOO");
			return;
		}
		var found = false;
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].name == member.weapon.name) {
				found = true;
				self.vue.band[0].inventory[i].num++;
			}
		}
		if(!found) {
			self.vue.band[0].inventory.push({
				name: member.weapon.name,
				is_weapon: member.weapon.is_weapon,
				damage: member.weapon.damage,
				num: 1
			});
		}
		member.weapon = {
			name: "fists",
			damage: 1
		};
	};

	self.can_equip_armor = function(member) {
		if(!self.vue) return false;
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].is_armor && member.armor.health_boost < self.vue.band[0].inventory[i].health_boost) {
				return true;
			}
		}
		return false;
	};

	self.equip_armor = function(member) {
		// TODO: open up a popup for equipping armor
			// make sure this doesn't conflict with other popups
		// first find the best armor
		var best_armor_index = -1;
		var best_armor_boost = 0;
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].is_armor && member.armor.health_boost < self.vue.band[0].inventory[i].health_boost
			&& best_armor_boost < self.vue.band[0].inventory[i].health_boost) {
				best_armor_index = i;
				best_armor_boost = self.vue.band[0].inventory[i].health_boost;
			}
		}
		if(best_armor_index == -1) {
			return;
		}
		// add back our current armor to the inventory if we have current armor other than fists
		if(member.armor.name != "nothing") {
			self.unequip_armor(member);
		}
		// set the armor to the new armor
		member.armor = {
			name: self.vue.band[0].inventory[best_armor_index].name,
			is_armor: self.vue.band[0].inventory[best_armor_index].is_armor,
			health_boost: self.vue.band[0].inventory[best_armor_index].health_boost
		};
		member.max_health += member.armor.health_boost;
		member.health += member.armor.health_boost;
		// remove that armor from the inventory
		if(self.vue.band[0].inventory[best_armor_index].num > 1) {
			self.vue.band[0].inventory[best_armor_index].num--;
		}
		else {
			self.vue.band[0].inventory.splice(best_armor_index, 1);
		}
	};

	self.unequip_armor = function(member) {
		if(member.armor.name == "nothing") {
			console.log("NOOOOOO");
			return;
		}
		var found = false;
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].name == member.armor.name) {
				found = true;
				self.vue.band[0].inventory[i].num++;
			}
		}
		if(!found) {
			self.vue.band[0].inventory.push({
				name: member.armor.name,
				is_armor: member.armor.is_armor,
				health_boost: member.armor.health_boost,
				num: 1
			});
		}
		member.max_health -= member.armor.health_boost;
		member.health -= member.armor.health_boost;
		if(member.health <= 0) {
			self.vue.popup_title = "You killed yourself!";
			self.vue.popup_desc = "Did you think we\'d just give you free health? Nah man, u ded";
			self.vue.popup_buttons = [
				{name: "Revive", onClick: function() {
					restartGame();
					self.vue.show_popup = false;
				}}
			]
			self.vue.show_popup = true;
		}
		member.armor = {
			name: "nothing",
			health_boost: 0
		};
	};

	self.send_to_village = function(i) {
		self.unequip_boi(i);
		self.vue.available_villagers++;
		self.vue.num_fighters[0]--;
		self.vue.fighter_group_health[0] -= self.vue.health_per_figher[0];
		if(self.vue.fighter_group_health[0] < 0) {
			self.vue.fighter_group_health[0] = 0;
		}
		self.vue.$forceUpdate();
	};

    // generic counter functions (for debugging purposes)
    self.loadCounter = function(){ 
        // console.log("getting the stored counter");
        // console.log( self.vue.counter);
        $.getJSON(load_counter_url, function (data) {
            // console.log("Loaded " + data.counter + " as the counter value" );
            self.vue.counter = data.counter;
        });
    };

    self.saveCounter = function(){
        // console.log("saving the counter");
        $.post(save_counter_url,
            { 
                counter: self.vue.counter
            },
            function (result) {
                // console.log( result )
            });
	};
	
	self.clicked = function () { //increments all resource counters
        self.vue.resources.forEach(function(d){
            d[1]++;
        });
	};

    self.incrementResource = function(name){ //increments only the specified resource counter
        console.log(name);
        self.vue.resources.forEach(function(d){
            if( d[0] == name){
                console.log(d[0]);
                d[1]++;
            }
        });
    };

    self.decrementResource = function(name){ //increments only the specified resource counter
        console.log(name);
        self.vue.resources.forEach(function(d){
            if( d[0] == name){
                console.log(d[0]);
                d[1]--;
            }
        });
    }

    // real stuff
    self.loadResources = function(){ //loads more than just resources
        // console.log( "loading all stored vals")
        resourcesList = ["coal","iron","mithril","steel","wood", "leather"];
        equipList = ["w_sword", "i_sword","s_sword","m_sword"]
        playerInfo = ["max_health","current_health","equipped_weapon","equipped_armor"]
        $.getJSON(load_resources_url, function (data) {
            //console.log(data );
            dataElems=Object.entries(data);
            dataElems.forEach(function(d,i){
                
                if (equipList.indexOf(d[0])>=0) {
                    d[1] = +d[1];
                    self.vue.equipment.push(d)
                }else if (resourcesList.indexOf(d[0])>=0){
                    d[1] = +d[1];
                    self.vue.resources.push(d)
                }else if (playerInfo.indexOf(d[0])>=0){
                    if(d[0]== "max_health"){
                        self.vue.band.max_health=+d[1];
                    } else if (d[0]=="current_health") {
                        self.vue.band.health=+d[1];
                    } else if (d[0]=="equipped_weapon") {
                        self.vue.band[0].weapon.name=d[1];
                    } else if (d[0]=="equipped_armor") {
                        self.vue.band[0].armor.name=d[1];
                    }else{
                        console.log("warning: did not store ", d);
                    }
                }else{
                    if(d[0]== "num_fighters"){
						self.vue.num_fighters= d[1];
						for(var i = 0; i < self.vue.num_fighters.length; i++) {
							self.vue.num_fighters[i] = +self.vue.num_fighters[i];
						}
                    } else if (d[0]=="fighter_health") {
						self.vue.fighter_group_health=d[1];
						for(var i = 0; i < self.vue.num_fighters.length; i++) {
							self.vue.fighter_group_health[i] = +self.vue.fighter_group_health[i];
						}
                    }else{
                        console.log("warning: did not store ", d);
                    }
                }
            });
            console.log(self.vue.equipment);
            console.log(self.vue.resources);
            //self.vue.resources = dataElems;
        });
        
    };

    self.saveResources = function(){ //saves more than just resources
        //console.log( "saving all resources")
        //console.log(self.vue.resources)
        $.post(save_resources_url,
            { 
                resources: self.vue.resources
            },
            function (result) {
                //console.log( result )
            });
    };

    autosave = function(){
        window.setInterval(self.saveResources, 60*1000);
    };

	self.send_villager_to_party = function(){
    	if(self.vue.available_villagers > 0){
    		self.vue.available_villagers -= 1;
    		self.vue.num_fighters[0] += 1;
    		self.vue.fighter_group_health[0] += self.vue.health_per_figher[0];
    		self.vue.$forceUpdate();
		}
	};

	self.increment_wood_gatherer = function(){
    	if(self.vue.available_villagers > 0){
    		self.vue.available_villagers -= 1;
    		self.vue.wood_gatherer += 1;
		}
	};

	self.decrement_wood_gatherer = function(){
    	if(self.vue.wood_gatherer > 0){
    		self.vue.available_villagers += 1;
    		self.vue.wood_gatherer -= 1;
		}
	};

	self.can_craft_steel = function() {
		return self.get_num_craftable_steel() > 0;
	};

	self.craft_steel = function() {
		addToResources("steel");
		removeFromResources("iron", 1);
		removeFromResources("coal", 1);
		self.vue.$forceUpdate();
	};

	self.get_num_craftable_steel = function() {
		var num_iron = getNumOfResource("iron");
		var num_coal = getNumOfResource("coal");
		// return min(num_iron, num_coal)
		return num_iron > num_coal ? num_coal : num_iron;
	};

	self.can_craft_wood_sword = function() {
		return self.get_num_craftable_wood_swords() > 0;
	};

	self.craft_wood_sword = function() {
		addToInventory({name: "wooden sword", is_weapon: true, damage: 2});
		removeFromResources("wood", 1);
		self.vue.$forceUpdate();
	};

	self.get_num_craftable_wood_swords = function() {
		return getNumOfResource("wood");
	};

	self.can_craft_iron_sword = function() {
		return self.get_num_craftable_iron_swords() > 0;
	};

	self.craft_iron_sword = function() {
		addToInventory({name: "iron sword", is_weapon: true, damage: 3});
		removeFromResources("iron", 1);
		removeFromResources("wood", 1);
		self.vue.$forceUpdate();
	};

	self.get_num_craftable_iron_swords = function() {
		var num_iron = getNumOfResource("iron");
		var num_wood = getNumOfResource("wood");
		// return min(num_iron, num_wood)
		return num_iron > num_wood ? num_wood : num_iron;
	};

	self.can_craft_steel_sword = function() {
		return self.get_num_craftable_steel_swords() > 0;
	};

	self.craft_steel_sword = function() {
		addToInventory({name: "steel sword", is_weapon: true, damage: 4});
		removeFromResources("steel", 1);
		removeFromResources("wood", 1);
		self.vue.$forceUpdate();
	};

	self.get_num_craftable_steel_swords = function() {
		var num_steel = getNumOfResource("steel");
		var num_wood = getNumOfResource("wood");
		// return min(num_steel, num_wood)
		return num_steel > num_wood ? num_wood : num_steel;
	};

	self.can_craft_mithril_sword = function() {
		return self.get_num_craftable_mithril_swords() > 0;
	};

	self.craft_mithril_sword = function() {
		addToInventory({name: "mithril sword", is_weapon: true, damage: 5});
		removeFromResources("mithril", 1);
		removeFromResources("wood", 1);
		self.vue.$forceUpdate();
	};

	self.get_num_craftable_mithril_swords = function() {
		var num_mithril = getNumOfResource("mithril");
		var num_wood = getNumOfResource("wood");
		// return min(num_mithril, num_wood)
		return num_mithril > num_wood ? num_wood : num_mithril;
	};

	self.can_craft_leather_armor = function() {
		return self.get_num_craftable_leather_armors() > 0;
	};

	self.craft_leather_armor = function() {
		addToInventory({name: "leather armor", is_armor: true, health_boost: 5});
		removeFromResources("leather", 1);
		self.vue.$forceUpdate();
	};

	self.get_num_craftable_leather_armors = function() {
		return getNumOfResource("leather");
	};

	self.can_craft_iron_armor = function() {
		return self.get_num_craftable_iron_armors() > 0;
	};

	self.craft_iron_armor = function() {
		addToInventory({name: "iron armor", is_armor: true, health_boost: 10});
		removeFromResources("iron", 1);
		removeFromResources("leather", 1);
		self.vue.$forceUpdate();
	};

	self.get_num_craftable_iron_armors = function() {
		var num_iron = getNumOfResource("iron");
		var num_leather = getNumOfResource("leather");
		// return min(num_iron, num_leather)
		return num_iron > num_leather ? num_leather : num_iron;
	};

	self.can_craft_steel_armor = function() {
		return self.get_num_craftable_steel_armors() > 0;
	};

	self.craft_steel_armor = function() {
		addToInventory({name: "steel armor", is_armor: true, health_boost: 15});
		removeFromResources("steel", 1);
		removeFromResources("leather", 1);
		self.vue.$forceUpdate();
	};

	self.get_num_craftable_steel_armors = function() {
		var num_steel = getNumOfResource("steel");
		var num_leather = getNumOfResource("leather");
		// return min(num_steel, num_leather)
		return num_steel > num_leather ? num_leather : num_steel;
	};

	self.can_craft_mithril_armor = function() {
		return self.get_num_craftable_mithril_armors() > 0;
	};

	self.craft_mithril_armor = function() {
		addToInventory({name: "mithril armor", is_armor: true, health_boost: 20});
		removeFromResources("mithril", 1);
		removeFromResources("leather", 1);
		self.vue.$forceUpdate();
	};

	self.get_num_craftable_mithril_armors = function() {
		var num_mithril = getNumOfResource("mithril");
		var num_leather = getNumOfResource("leather");
		// return min(num_mithril, num_leather)
		return num_mithril > num_leather ? num_leather : num_mithril;
	};

	self.increment_hunter = function(){
    	if(self.vue.available_villagers > 0){
    		self.vue.available_villagers -= 1;
    		self.vue.hunter += 1;
		}
	};

	self.decrement_hunter = function(){
    	if(self.vue.hunter > 0){
    		self.vue.available_villagers += 1;
    		self.vue.hunter -= 1;
		}
	};

	self.increment_coal_miner = function(){
    	if(self.vue.available_villagers > 0){
    		self.vue.available_villagers -= 1;
    		self.vue.coal_miner += 1;
		}
	};

	self.decrement_coal_miner = function(){
    	if(self.vue.coal_miner > 0){
    		self.vue.available_villagers += 1;
    		self.vue.coal_miner -= 1;
		}
	};

	self.increment_iron_miner = function(){
    	if(self.vue.available_villagers > 0){
    		self.vue.available_villagers -= 1;
    		self.vue.iron_miner += 1;
		}
	};

	self.decrement_iron_miner = function(){
    	if(self.vue.iron_miner > 0){
    		self.vue.available_villagers += 1;
    		self.vue.iron_miner -= 1;
		}
	};

	self.increment_mithril_miner = function(){
    	if(self.vue.available_villagers > 0){
    		self.vue.available_villagers -= 1;
    		self.vue.mithril_miner += 1;
		}
	};

	self.decrement_mithril_miner = function(){
    	if(self.vue.mithril_miner > 0){
    		self.vue.available_villagers += 1;
    		self.vue.mithril_miner -= 1;
		}
	};

	self.can_equip_boi = function(index) {
		if(!self.vue) return false;
		if(i == 4) return false; // can't upgrade level 5 fighters
		// find the items in the inventory
		var found_item1 = false;
		var found_item2 = false;
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].name == self.vue.upgrade_items[index][0].name) {
				found_item1 = true;
			}
			if(self.vue.band[0].inventory[i].name == self.vue.upgrade_items[index][1].name) {
				found_item2 = true;
			}
		}
		return found_item1 && found_item2;
	};

	self.equip_boi = function(i) {
		if(i != 0) {
			addToInventory(self.vue.upgrade_items[i - 1][0]);
			addToInventory(self.vue.upgrade_items[i - 1][1]);
		}
		removeFromInventory(self.vue.upgrade_items[i][0]);
		removeFromInventory(self.vue.upgrade_items[i][1]);
		self.vue.num_fighters[i]--;
		self.vue.fighter_group_health[i] -= self.vue.health_per_figher[i];
		if(self.vue.fighter_group_health[i] < 0) {
			self.vue.fighter_group_health[i] = 0;
		}
		self.vue.num_fighters[i + 1]++;
		self.vue.fighter_group_health[i + 1] += self.vue.health_per_figher[i + 1];
		self.vue.$forceUpdate();
	};

	self.unequip_boi = function(i) {
		if(i == 0) return;
		addToInventory(self.vue.upgrade_items[i - 1][0]);
		addToInventory(self.vue.upgrade_items[i - 1][1]);
		self.vue.num_fighters[0]++;
		self.vue.fighter_group_health[0] += self.vue.health_per_figher[0];
		self.vue.num_fighters[i]--;
		self.vue.fighter_group_health[i] -= self.vue.health_per_figher[i];
		if(self.vue.fighter_group_health[i] < 0) {
			self.vue.fighter_group_health[i] = 0;
		}
		self.vue.$forceUpdate();
	};

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
			show_popup: false,
			popup_title: "test title",
			popup_desc: "test desc",
			popup_buttons: [],
			logged_in: false,
			band: [
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
			],
			enemy_health: 10,
			in_battle: false,
			player_attack_time: 16, // used for limiting player attacks

			viewing_resources: false,
			viewing_party: true,
			viewing_village: false,
			viewing_assignment: false,
			viewing_crafting: false,

			my_name: "You",
			num_fighters: [2, 0, 0, 0, 0], // each element is a different level of fighter
			fighter_group_health: [20, 0, 0, 0, 0],
			health_per_figher: [10, 15, 20, 25, 30],
			damage_per_figher: [1, 2, 3, 4, 5],
			upgrade_items: [
				[{name: "wooden sword", is_weapon: true, damage: 2}, {name: "leather armor", is_armor: true, health_boost: 5}],
				[{name: "iron sword", is_weapon: true, damage: 3}, {name: "iron armor", is_armor: true, health_boost: 10}],
				[{name: "steel sword", is_weapon: true, damage: 4}, {name: "steel armor", is_armor: true, health_boost: 15}],
				[{name: "mithril sword", is_weapon: true, damage: 5}, {name: "mithril armor", is_armor: true, health_boost: 20}],
			],
			num_villagers: 0,
			cur_fighter_health: -1,

            //counter: 0,
            resources: [],
            equipment: [],
			available_villagers: 0,
			wood_gatherer: 0,
			hunter: 0,
			coal_miner: 0,
			iron_miner: 0,
            mithril_miner: 0,
			coal_mine_unlocked: false,
			iron_mine_unlocked: false,
            mithril_mine_unlocked: false,
        },
        methods: {
			closePopup: self.closePopup,
			get_band_health: self.get_band_health,

			show_view_panel_resources: self.show_view_panel_resources,
			show_view_panel_party: self.show_view_panel_party,
			show_view_panel_village: self.show_view_panel_village,
			show_view_panel_crafting: self.show_view_panel_crafting,

			can_eat_food: self.can_eat_food,
			eat_food: self.eat_food,

			can_equip_weapon: self.can_equip_weapon,
			equip_weapon: self.equip_weapon,
			unequip_weapon: self.unequip_weapon,

			can_equip_armor: self.can_equip_armor,
			equip_armor: self.equip_armor,
			unequip_armor: self.unequip_armor,

			send_to_village: self.send_to_village,
			send_party_member_home:self.send_party_member_home,
			send_villager_to_party:self.send_villager_to_party,
			increment_wood_gatherer:self.increment_wood_gatherer,
			decrement_wood_gatherer:self.decrement_wood_gatherer,
			increment_hunter:self.increment_hunter,
			decrement_hunter:self.decrement_hunter,
			increment_coal_miner:self.increment_coal_miner,
			decrement_coal_miner:self.decrement_coal_miner,
			increment_iron_miner:self.increment_iron_miner,
			decrement_iron_miner:self.decrement_iron_miner,
			increment_mithril_miner:self.increment_mithril_miner,
			decrement_mithril_miner:self.decrement_mithril_miner,

			clicked: self.clicked,
			incrementResource: self.incrementResource,
			
            //loadCounter: self.loadCounter,
            //saveCounter: self.saveCounter,
            loadResources: self.loadResources,
			saveResources: self.saveResources,
			
			can_craft_steel: self.can_craft_steel,
			craft_steel: self.craft_steel,
			get_num_craftable_steel: self.get_num_craftable_steel,
			
			can_craft_wood_sword: self.can_craft_wood_sword,
			craft_wood_sword: self.craft_wood_sword,
			get_num_craftable_wood_swords: self.get_num_craftable_wood_swords,

			can_craft_iron_sword: self.can_craft_iron_sword,
			craft_iron_sword: self.craft_iron_sword,
			get_num_craftable_iron_swords: self.get_num_craftable_iron_swords,

			can_craft_steel_sword: self.can_craft_steel_sword,
			craft_steel_sword: self.craft_steel_sword,
			get_num_craftable_steel_swords: self.get_num_craftable_steel_swords,

			can_craft_mithril_sword: self.can_craft_mithril_sword,
			craft_mithril_sword: self.craft_mithril_sword,
			get_num_craftable_mithril_swords: self.get_num_craftable_mithril_swords,

			can_craft_leather_armor: self.can_craft_leather_armor,
			craft_leather_armor: self.craft_leather_armor,
			get_num_craftable_leather_armors: self.get_num_craftable_leather_armors,

			can_craft_iron_armor: self.can_craft_iron_armor,
			craft_iron_armor: self.craft_iron_armor,
			get_num_craftable_iron_armors: self.get_num_craftable_iron_armors,

			can_craft_steel_armor: self.can_craft_steel_armor,
			craft_steel_armor: self.craft_steel_armor,
			get_num_craftable_steel_armors: self.get_num_craftable_steel_armors,

			can_craft_mithril_armor: self.can_craft_mithril_armor,
			craft_mithril_armor: self.craft_mithril_armor,
			get_num_craftable_mithril_armors: self.get_num_craftable_mithril_armors,

			can_equip_boi: self.can_equip_boi,
			equip_boi: self.equip_boi,
			unequip_boi: self.unequip_boi,
        }
    });

	self.get_name = function() {
		$.get(get_name_url, function(data) {
			self.vue.logged_in = data.logged_in;
			self.vue.my_name = data.name;
			self.vue.band[0].name = self.vue.my_name;
		});
	};
	self.get_name();
	$("#vue-div").show();


    //self.loadCounter(); 
    self.loadResources();
    self.show_view_panel_resources();
    window.setInterval(function(){
		if(!self.vue.logged_in) return;
        addToResources("wood",self.vue.wood_gatherer);
        addToResources("leather",self.vue.hunter);
        addToResources("coal",self.vue.coal_miner);
		addToResources("iron",self.vue.iron_miner);
		self.vue.$forceUpdate();
    }, 1000);
    autosave();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
