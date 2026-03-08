/* Start of my own code */

// these need to be global so the p5.gui addGlobals() function can find them
var amplitudeScale = 0.1;  // controls how wide the wave wobbles
var strokeThickness = 2;   // thickness of the wave lines
var vOffset = 50;          // gap between the V shapes and the screen edges

function WavePattern() {
    this.name = "wavepattern";

    /* start of CHATGPT to generate GUI code */
    this.setupGUI = function() {
        gui = createGui("WavePattern Controls");
        gui.show();
        gui.setPosition(windowWidth - 260, 10);

        sliderRange(0, 0.5, 0.005);
        gui.addGlobals("amplitudeScale");

        sliderRange(1, 10, 1);
        gui.addGlobals("strokeThickness");

        sliderRange(0, 200, 1);
        gui.addGlobals("vOffset");
    };

    this.onResize = function() {
        if (gui) gui.setPosition(windowWidth - 260, 10);
    };
    /* end of CHATGPT to generate GUI code */

    // draws a single arm of a V shape
    // startFromBottom = true means the V points downward (bass)
    // flipSide = true draws the right arm of the V
    this.drawVArm = function(wave, energy, startFromBottom, flipSide) {
        beginShape();
        for (let i = 0; i < wave.length; i++) {
            // d goes from 0 to almost full screen height
            let d = map(i, 0, wave.length, 0, height * 0.9);

            // wobble amount based on the waveform and the frequency energy
            let wobble = wave[i] * width * amplitudeScale * energy;

            // ternary: right arm adds d, left arm subtracts d
            let x = flipSide ? width * 0.5 + d + wobble : width * 0.5 - d + wobble;

            // ternary: downward V starts from bottom, upward V starts from top
            let y = startFromBottom ? height - d - vOffset : d + vOffset;

            vertex(x, y);
        }
        endShape();
    };

    this.draw = function() {
        push();
        noFill();
        strokeWeight(strokeThickness);
        // get the waveform and energy levels for bass and treble
        let wave = fft.waveform();
        let bassEnergy = fft.getEnergy("bass") / 255;
        let trebleEnergy = fft.getEnergy("treble") / 255;

        // DOWNWARD V shape reacts to bass (blue)
        stroke(0, 100, 255);
        this.drawVArm(wave, bassEnergy, true, false);  // left arm
        this.drawVArm(wave, bassEnergy, true, true);   // right arm

        // UPWARD V shape reacts to treble (orange)
        stroke(255, 100, 0);
        this.drawVArm(wave, trebleEnergy, false, false);  // left arm
        this.drawVArm(wave, trebleEnergy, false, true);   // right arm

        pop();
    };
}

/* End of my own code */
