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
		for(var i = 0; i < self.vue.band.length; i++) {
			health += self.vue.band[i].health;
		}
		return health;
	};
	
	self.toggle_view_pane = function() {
		self.vue.viewing_resources = !self.vue.viewing_resources;
	};

	self.can_eat_food = function(member) {
		// TODO: change this when we change max health due to armor and stuff
		if(member.health >= 10) return false; // cant heal if full health
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].name == "food" && self.vue.band[0].inventory[i].num > 0) {
				return true;
			}
		}
		return false;
	};

	self.can_equip_weapon = function(member) {
		if(!self.vue) return false;
		for(var i = 0; i < self.vue.band[0].inventory.length; i++) {
			if(self.vue.band[0].inventory[i].is_weapon) {
				return true;
			}
		}
		return false;
	};

    // generic counter functions (for debugging purposes)
    self.loadCounter = function(){ 
        console.log("getting the stored counter");
        console.log( self.vue.counter);
        $.getJSON(load_counter_url, function (data) {
            console.log("Loaded "+data.counter+" as the counter value" );
            self.vue.counter = data.counter;
        });
    };

    self.saveCounter = function(){
        console.log("saving the counter");
        $.post(save_counter_url,
            { 
                counter: self.vue.counter
            },
            function (result) {
                console.log( result )
            });
    };

    // real stuff
    self.loadResources = function(){
        console.log( "loading all stored vals")
    };

    self.saveResources = function(){
        console.log( "saving all resources")
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
					health: 10,
					weapon: {
						name: "fists",
						damage: 1
					},
					inventory: []
				} // any more is people you've recruited
			],
			enemy_health: 10,
			in_battle: false,
			player_attack_time: 16, // used for limiting player attacks
			viewing_resources: false,

            counter: 0
        },
        methods: {
			closePopup: self.closePopup,
			get_band_health: self.get_band_health,
			toggle_view_pane: self.toggle_view_pane,
			can_eat_food: self.can_eat_food,
			can_equip_weapon: self.can_equip_weapon,

            loadCounter: self.loadCounter,
            saveCounter: self.saveCounter,
            // real stuff
            loadResources: self.loadResources,
            saveResources: self.saveResources
        }
    });

	self.check_logged_in = function() {
		$.get(check_logged_in_url, function(data) {
			self.vue.logged_in = data.logged_in;
			// $("#vue-div").show();
		});
	};
	self.check_logged_in();
	$("#vue-div").show();


    self.loadCounter(); 
    self.loadResources();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

/* General TODOs

Exploration parts
	Make food eatable in and out of combat
	Make random loot bags with random items
	Be able to equip weapons onto and off of yourself and band members
	Implement armor in the same way as weapons

Idle game parts
	Be able to assign yourself and band members to certain tasks to collect resources
	Decide on how to gather resources
	Be able to craft items using resources
	Decide on what items, resources, and crafting recipes we're gonna put in the game

Save progress
	Store items, resources, and band members in the database in tables.py

*/
