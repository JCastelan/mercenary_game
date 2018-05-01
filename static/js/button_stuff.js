//The file to put all functions that are activated by buttons

var counter = 0;

//basic counter incrementing function
function clicked() {
	counter++;
	var x = document.getElementById("counter");
	x.innerHTML= counter;
}
