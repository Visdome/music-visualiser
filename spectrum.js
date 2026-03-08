/* Start of my own code */

// these need to be global so the p5.gui addGlobals() function can find them
var specMaxBarWidth = 0.5;  // how far across the screen bars can reach (0-1)
var specBarAlpha = 200;     // transparency of each bar

function Spectrum() {
    this.name = "spectrum";

    /* start of CHATGPT to generate GUI code */
    this.setupGUI = function() {
        gui = createGui("Spectrum Controls");
        gui.show();
        gui.setPosition(windowWidth - 260, 10);

        sliderRange(0.1, 1, 0.01);
        gui.addGlobals("specMaxBarWidth");

        sliderRange(0, 255, 1);
        gui.addGlobals("specBarAlpha");
    };

    this.onResize = function() {
        if (gui) gui.setPosition(windowWidth - 260, 10);
    };
    /* end of CHATGPT to generate GUI code */

    // works out what colour a bar should be based on its amplitude
    // low amplitude = green, high amplitude = red
    this.getBarColour = function(amplitude) {
        // red goes up as amplitude goes up (0 to 255)
        let r = amplitude;
        // green goes down as amplitude goes up (255 to 0)
        let g = map(amplitude, 0, 255, 255, 0);
        let b = 0;
        return color(r, g, b, specBarAlpha);
    };
    // draws the spectrum bars on the screen
    this.draw = function() {
        push();

        let spectrum = fft.analyze();
        noStroke();

        // only use half the spectrum (the rest is too high pitched to matter)
        let total = spectrum.length / 2;

        // height of each bar - evenly spaced down the screen
        let barHeight = height / total;

        for (let i = 0; i < total; i++) {
            let amplitude = spectrum[i * 2];

            // how wide the bar is - based on amplitude
            let w = map(amplitude, 0, 255, 10, width * specMaxBarWidth);

            // y position - bars go top to bottom
            let y = i * barHeight;

            // set colour based on amplitude (green to red)
            fill(this.getBarColour(amplitude));

            // draw bar from the left side of the screen
            rect(0, y, w, barHeight - 1);
        }

        pop();
    };
}

/* End of my own code */
