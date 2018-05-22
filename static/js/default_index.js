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

    self.get_wood = function() {
        console.log("Wood increased!");
        self.vue.gathering_wood = !self.vue.gathering_wood;
        // self.vue.edit_id = memo_id;
    };

    self.get_iron = function() {
        console.log("iron increased!");
        self.vue.gathering_iron = !self.vue.gathering_iron;
        // self.vue.edit_id = memo_id;
    };

    self.get_coal = function() {
        console.log("coal increased!");
        self.vue.gathering_coal = !self.vue.gathering_coal;
        // self.vue.edit_id = memo_id;
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            resource: [],
            resource_wood: null,
            resource_iron: null,
            resource_coal: null,
            gathering_wood: false,
            gathering_iron: false,
            gathering_coal: false,
        },
        methods: {
            get_wood: self.get_wood,
            get_iron: self.get_iron,
            get_coal: self.get_coal,
        }

    });


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
