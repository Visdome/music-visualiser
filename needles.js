// constructor function to draw needles
function Needles() {

	this.name = "needles";
	var minAngle = PI ;
	var maxAngle = TWO_PI ;

	this.plotsAcross = 2;
	this.plotsDown = 2;
	this.frequencyBins = ["bass", "lowMid", "treble", "highMid"];
	this.onResize = function() {
		this.pad = width / 20;
		this.plotWidth = (width - this.pad) / this.plotsAcross;
		this.plotHeight = (height - this.pad) / this.plotsDown;
		this.dialRadius = (this.plotWidth - this.pad) / 2 - 5;
	};
	// call onResize once to set up initial dimensions based on the initial window size
	this.onResize();
	this.draw = function() {

		fft.analyze();

		var currentBin = 0;

		push();
		fill('#f0f2d2');

		/* Start of my own code */
		// draw a glowing red ring behind each dial column for visual effect
		for (var col = 0; col < this.plotsAcross; col++) {

			var x = this.pad + col * this.plotWidth;
			var w = this.plotWidth - this.pad;
			var centreX = x + w / 2;
			// centre the glow vertically between the two rows
			var topY = this.pad + this.plotHeight - this.pad;
			var bottomY = this.pad + this.plotHeight;
			var glowY = (topY + bottomY) / 2;
			var glowSize = this.dialRadius + 18;

			noFill();
			strokeWeight(6);
			// draw 4 rings with decreasing opacity to create a glow look
			for (var g = 0; g < 4; g++) {
				stroke(255, 80, 80, 60 - g * 8);
				ellipse(centreX, glowY, glowSize * 2 + g * 8);
			}
			strokeWeight(1);
		}
		/* End of my own code */

		// draw dials
		for (var row = 0; row < this.plotsDown; row++) {
			for (var col = 0; col < this.plotsAcross; col++) {

				var x = this.pad + col * this.plotWidth;
				var y = this.pad + row * this.plotHeight;
				var w = this.plotWidth - this.pad;
				var h = this.plotHeight - this.pad;

				var centreX = x + w / 2;
				var baseY;
				// position baseY at the bottom of the plot for the top row, and at the top of the plot
				// for the bottom row, so needles grow towards the centre
				if (row === 0) {
					baseY = y + h;
				} else {
					baseY = y;
				}
				// get the frequency bin for this dial and its energy level
				var freq = this.frequencyBins[currentBin];
				var energy = fft.getEnergy(freq);

				this.ticks(centreX, baseY, freq, row);
				this.needle(energy, centreX, baseY, row);

				currentBin++;
			}
		}

		pop();
	};
	// draw a single needle based on the energy level of its frequency bin
	this.needle = function(energy, centreX, baseY, row) {
		// draw needle based on energy
		push();
		stroke('#ffffff');
		translate(centreX, baseY);

		if (row === 1) {
			scale(1, -1);
		}
		// map energy level to angle between minAngle and maxAngle
		var angle = map(energy, 0, 255, minAngle, maxAngle);
		var x = this.dialRadius * cos(angle);
		var y = this.dialRadius * sin(angle);

		line(0, 0, x, y);
		pop();
	};

	this.ticks = function(centreX, baseY, freqLabel, row) {
	
		var nextTickAngle = minAngle;
		push();
		stroke('#ffffff');
		fill('#ffffff');
		translate(centreX, baseY);
		// flip for bottom row
		if (row === 1) {
			scale(1, -1);
		}

		ellipse(0, 0, 10, 10);
		// draw 11 ticks around the dial
		for (var i = 0; i < 11; i++) {
			var x = this.dialRadius * cos(nextTickAngle);
			var x1 = (this.dialRadius - 5) * cos(nextTickAngle);
			var y = this.dialRadius * sin(nextTickAngle);
			var y1 = (this.dialRadius - 5) * sin(nextTickAngle);

			line(x, y, x1, y1);
			nextTickAngle = nextTickAngle + PI / 10;
		}

		pop();
		// draw frequency label above the top row dials and below the bottom row dials
		push();
		fill('#ffffff');
		textAlign(CENTER);
		textSize(12);
		// position label
		var textY;
		if (row === 0) {// top row
			textY = baseY - this.plotHeight / 2;
		} else {// bottom row
			textY = baseY + this.plotHeight / 2;
		}
		text(freqLabel, centreX, textY);
		pop();
	};
}
