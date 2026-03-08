/* Start of my own code */

// these need to be global so the p5.gui addGlobals() function can find them
var rotationSpeed = 0.5 * Math.PI / 180;  // how fast each block rotates
var numBlocks = 10;                         // how many blocks are shown
var noiseSpeed = 0.01;                      // how fast the noise curve moves
var noiseRoughness = 0.01;                  // how rough/jagged the noise curve looks
var noiseColor = "#00ff00";               // colour of the noise curve

function Blocks() {
    this.name = "blocks";

    // private variables - only used inside this constructor
    let progThresh = 180;       // bass level needed to move the noise curve
    let rotateThresh = 60;      // treble level needed to rotate the blocks
    let blockRotations = [];    // tracks the current rotation of each block
    let prog = 0;               // tracks how far the noise animation has progressed
    let lastNumBlocks = numBlocks; // used to detect when numBlocks changes in the GUI

    // sets up the blockRotations array with a zero for each block
    this.initBlocks = function() {
        blockRotations = [];
        for (let i = 0; i < numBlocks; i++) {
            blockRotations[i] = 0;
        }
    };
    this.initBlocks();

    /* start of CHATGPT to generate GUI code */
    this.setupGUI = function() {
        gui = createGui("Blocks Controls");
        gui.show();
        gui.setPosition(windowWidth - 260, 10);

        sliderRange(0, 0.05, 0.001);
        gui.addGlobals("rotationSpeed");

        sliderRange(2, 20, 1);
        gui.addGlobals("numBlocks");

        sliderRange(0, 0.05, 0.001);
        gui.addGlobals("noiseSpeed");

        sliderRange(0.001, 0.05, 0.001);
        gui.addGlobals("noiseRoughness");

        gui.addGlobals("noiseColor");
    };

    this.onResize = function() {
        if (gui) gui.setPosition(windowWidth - 260, 10);
    };
    /* end of CHATGPT to generate GUI code */

    // draws the wriggly noise curve in the background
    this.drawNoiseCurve = function(bass) {
        // move the noise forward when bass is strong enough
        if (bass > progThresh) {
            prog += noiseSpeed;
        }
        push();
        translate(width / 2, height / 2);
        noFill();
        stroke(noiseColor);
        strokeWeight(3);

        beginShape();
        for (let i = 0; i < 100; i++) {
            // noise() gives a smooth random value between 0 and 1
            let x = noise(i * noiseRoughness, prog);
            let y = noise(i * noiseRoughness, prog + 1000);
            // remap from 0-1 range to screen coordinates
            x = map(x, 0, 1, -250, 250);
            y = map(y, 0, 1, -250, 250);
            vertex(x, y);
        }
        endShape();
        pop();
    };
    // draws all the rotating blocks in a row
    this.drawBlocks = function(bass, treble) {
        push();
        rectMode(CENTER);
        translate(width / 2, height / 2);

        // space blocks evenly across the screen
        let spacing = width / (numBlocks + 2);

        for (let i = 0; i < numBlocks; i++) {
            // block size grows with bass
            let size = map(bass, 0, 255, 20, 50);

            // rotate alternating blocks in opposite directions when treble is strong
            if (treble > rotateThresh) {
                if (i % 2 === 0) {
                    blockRotations[i] -= rotationSpeed;
                } else {
                    blockRotations[i] += rotationSpeed;
                }
            }
            push();
            rotate(blockRotations[i]);
            fill(0, 0, 255);
            stroke(0, 0, 200);
            rect((i - numBlocks / 2) * spacing, 0, size, size);
            pop();
        }

        pop();
    };
    this.draw = function() {
        background(0);

        fft.analyze();
        let bass = fft.getEnergy("bass");
        let treble = fft.getEnergy("treble");

        // if the user changed numBlocks in the GUI, reset the rotations array
        if (numBlocks !== lastNumBlocks) {
            this.initBlocks();
            lastNumBlocks = numBlocks;
        }

        // draw the two parts of the visualisation
        this.drawNoiseCurve(bass);
        this.drawBlocks(bass, treble);
    };
}

/* End of my own code */
