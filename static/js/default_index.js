// This is the js for the default/index.html view.

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
		if(grid[playerPos.y][playerPos.x].char == bossChar) {
			initHubWorldGrid(100, 40);
			displayGrid();
		}
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
					inventory: {
						weapon: {
							name: "fists",
							damage: 1
						}
					}
				} // any more is people you've recruited
			],
			enemy_health: 10,
			in_battle: false,
			player_attack_time: 16, // used for limiting player attacks
			viewing_resources: false
        },
        methods: {
			closePopup: self.closePopup,
			get_band_health: self.get_band_health,
			toggle_view_pane: self.toggle_view_pane
        }
    });

	self.check_logged_in = function() {
		$.get(check_logged_in_url, function(data) {
			self.vue.logged_in = data.logged_in;
			$("#vue-div").show();
		});
	};
	self.check_logged_in();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
