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

    // generic counter functions
    self.getCounter = function(){ 
        console.log("getting the stored counter")
    }

    self.saveCounter = function(){
        console.log("saving the counter")
    }

    // 
    self.loadResources(){
        console.log( "loading all stored vals")
    }

    self.saveResources(){
        console.log( "saving all resources")
    }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            current_counter: 0
            //real stuff 

        },
        methods: {
            saveCounter: self.saveCounter,
            getCounter: self.getCounter,
            // real stuff
            loadResources: self.loadResources,
            saveResources: self.saveResources
        }

    });

    self.getCounter();
    self.loadResources();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
