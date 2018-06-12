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
        ids = ["b_res", "b_village", "b_party"];
        ids.forEach(function(d){
            if( d == id){
                document.getElementById(d).classList.add(activated_color);
            }else{
                document.getElementById(d).classList.remove(activated_color);
            }
        });

    }
    activated_color = 'yellow';
	self.show_view_panel_resources = function() {
        switch_tab("b_res");
		self.vue.viewing_resources = true;
		self.vue.viewing_party = false;
		self.vue.viewing_village = false;
	};

	self.show_view_panel_party = function() {
        switch_tab("b_party");
		self.vue.viewing_resources = false;
		self.vue.viewing_party = true;
		self.vue.viewing_village = false;
	};

	self.show_view_panel_village = function() {
        switch_tab("b_village");
		self.vue.viewing_resources = false;
		self.vue.viewing_party = false;
		self.vue.viewing_village = true;
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
					APP.vue.show_popup = false;
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
		self.vue.available_villagers++;
		self.vue.num_fighters[i]--;
		self.vue.fighter_group_health[i] -= self.vue.health_per_figher[i];
		if(self.vue.fighter_group_health[i] < 0) {
			self.vue.fighter_group_health[i] = 0;
		}
		APP.vue.$forceUpdate();
		// TODO: based on which level we decremented from, add the necessary upgrade items back to the inventory
	}

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
	
	self.clicked = function () { //increments all counters
		self.vue.counter++;
        self.vue.resources.forEach(function(d){
            d[1]++;
        });
	}

    self.incrementResource = function(name){ //increments only the specified counter
        console.log(name);
        self.vue.resources.forEach(function(d){
            if( d[0] == name){
                console.log(d[0]);
                d[1]++;
            }
        });
    }

    // real stuff
    self.loadResources = function(){
        // console.log( "loading all stored vals")
        $.getJSON(load_resources_url, function (data) {
            //console.log(data );
            dataElems=Object.entries(data);
            dataElems.forEach(function(d){
                d[1] = +d[1];
            });
            console.log(dataElems);
            self.vue.resources = dataElems;
        });
        
    };

    self.saveResources = function(){
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
        window.setInterval(self.saveResources, 5000);
    }

	self.increment_wood_gatherer = function(){
    	if(self.vue.available_villagers > 0){
    		self.vue.available_villagers -= 1;
    		self.vue.wood_gatherer += 1;
		}
	}

	self.decrement_wood_gatherer = function(){
    	if(self.vue.wood_gatherer > 0){
    		self.vue.available_villagers += 1;
    		self.vue.wood_gatherer -= 1;
		}
	}

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
						damage: 10
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
			my_name: "You",
			num_fighters: [0, 0, 0, 0, 0], // each element is a different level of fighter
			fighter_group_health: [0, 0, 0, 0, 0],
			health_per_figher: [10, 15, 20, 25, 30],
			damage_per_figher: [1, 2, 3, 4, 5],
			num_villagers: 0,
			cur_fighter_health: -1,

            counter: 0,
            resources: null,
			available_villagers: 1,
			wood_gatherer: 0,
        },
        methods: {
			closePopup: self.closePopup,
			get_band_health: self.get_band_health,

			show_view_panel_resources: self.show_view_panel_resources,
			show_view_panel_party: self.show_view_panel_party,
			show_view_panel_village: self.show_view_panel_village,

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
			increment_wood_gatherer:self.increment_wood_gatherer,
			decrement_wood_gatherer:self.decrement_wood_gatherer,

			clicked: self.clicked,
			incrementResource: self.incrementResource,
			
            loadCounter: self.loadCounter,
            saveCounter: self.saveCounter,
            loadResources: self.loadResources,
            saveResources: self.saveResources
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


    self.loadCounter(); 
    self.loadResources();
    self.show_view_panel_resources();
    autosave();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

/* General TODOs

Exploration parts
	Remake recruiting
		For getting attacked by enemies, lets just give the group a health bar,
		and when it gets below a multiple of the health per fighter, we decrement the number of fighters
	Make random loot bags with random items

Idle game parts
	Be able to assign yourself and band members to certain tasks to collect resources JACK
	Decide on how to gather resources
	Be able to craft items using resources
	Decide on what items, resources, and crafting recipes we're gonna put in the game

Save progress
	Store items, resources, and band members in the database in tables.py

*/
