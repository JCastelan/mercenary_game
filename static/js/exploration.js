var grid = [];

function initGrid(width, height) {
	for(var x = 0; x < width; x++) {
		grid.push([]);
		for(var y = 0; y < height; y++) {
			grid[x].push('a');
		}
	}
}
