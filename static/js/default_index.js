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

    //function for incrementing the counter
    self.incrementCounter = function(){
        self.vue.current_counter++;
        console.log(self.vue.current_counter)
        //var x = document.getElementById("counter");
        //x.innerHTML= self.vue.current_counter;
    }

    // generic counter functions (for debugging purposes)
    self.loadCounter = function(){ 
        console.log("getting the stored counter");
        console.log( self.vue.current_counter);
        $.getJSON(load_counter_url, function (data) {
            console.log("Loaded "+data.counter+" as the counter value" );
            self.vue.current_counter = data.counter;
        });
        //var x = document.getElementById("counter");
        //x.innerHTML= self.vue.current_counter;
    };

    self.saveCounter = function(){
        console.log("saving the counter: ", self.vue.current_counter);
        $.post(save_counter_url,
            { 
                counter: self.vue.current_counter
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
            current_counter: 0
            //real stuff 

        },
        methods: {
            incrementCounter: self.incrementCounter,
            loadCounter: self.loadCounter,
            saveCounter: self.saveCounter,
            // real stuff
            loadResources: self.loadResources,
            saveResources: self.saveResources
        }

    });

    self.loadCounter(); 
    self.loadResources();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
