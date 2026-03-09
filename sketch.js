//Global variables 
var controls;
var vis;
var sound;
var fft;
var gui;
var lastVisualName = "";
var electronLayer;
var trackManager;
var trackNames;

//   PRELOAD  
function preload() {
    fft = new p5.FFT();

    /* Start of my own code */
    // create the track manager and load all sounds through it
    trackManager = new TrackManager(fft);
    trackManager.loadTracks();
    trackNames = trackManager.getNames();

    // set the initial sound from the manager
    sound = trackManager.getCurrentSound();
    /* End of my own code */
}

//   SETUP  
function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1); // Force pixel density to 1
    background(20, 5, 30);

    // create separate WEBGL layer for Electron visualization
    electronLayer = createGraphics(windowWidth, windowHeight, WEBGL);
    electronLayer.pixelDensity(1); // Force pixel density to 1 for layer too

    controls = new ControlsAndInput();

    fft.setInput(sound);
    // create the visualisation manager and add each visualisation to it
    vis = new Visualisations();
    vis.add(new Spectrum());
    vis.add(new Needles());
    vis.add(new WavePattern());
    vis.add(new Blocks());
    vis.add(new Electron(electronLayer));
}

/* Start of my own code */
// switchTrack is called by the dropdown in controlsAndInput.js
// it delegates all the work to trackManager
function switchTrack(index) {
    trackManager.switchTo(index, controls.playbackButton);
    sound = trackManager.getCurrentSound();
    fft.setInput(sound);
}
/* End of my own code */

// draw loop - calls the draw function of the selected visualisation and the controls 
function draw() {
    background(20, 5, 30);

    if (vis.selectedVisual) {

        if (vis.selectedVisual.name != lastVisualName) {
            lastVisualName = vis.selectedVisual.name;
            if (gui) gui.hide();
            if (vis.selectedVisual.setupGUI) vis.selectedVisual.setupGUI();
        }
        // call the draw function of the selected visualisation
        fft.analyze();

        if (vis.selectedVisual.name == "electron") {
            vis.selectedVisual.draw();

            image(electronLayer, 0, 0);

            // draw the atom selector buttons on the main canvas
            vis.selectedVisual.drawButtons();

            // draw message on main canvas
            if (vis.selectedVisual.getMessageTimer() > 0) {
                push();
                textAlign(CENTER, TOP);
                textSize(28);
                fill(0, 200);
                rect(width/2 - 180, height - 150, 360, 45, 10);
                fill(0, 255, 255);
                text(vis.selectedVisual.getMessage(), width/2, height - 140);
                pop();
                vis.selectedVisual.decrementMessageTimer();
            }

            // draw instruction on main canvas
            push();
            textAlign(CENTER);
            textSize(24);
            fill(255);
            text("Press R to toggle rotation", width/2, height-50);
            pop();

            // atom model name - reads from the current atom dynamically
            push();
            textAlign(CENTER);
            textSize(24);
            fill(255);
            text(vis.selectedVisual.getCurrentAtomName() + " Atom Model", width/2, height-90);
            pop();
        } else {
            vis.selectedVisual.draw();
        }
    }

    controls.draw();
}

// mousePressed - handles fullscreen toggling and delegates to visualisations and controls as needed 
function mousePressed() {
    //   ROTATION MODE SPECIAL CASE  
    if (vis.selectedVisual &&
        vis.selectedVisual.name == "electron" &&
        vis.selectedVisual.isRotationEnabled()) {

        // allow clicks ONLY on the playback button
        if (controls.playbackButton.hitCheck()) {
            controls.playbackButton.mousePressed();
        }
        return; // ignore everything else
    }

    // if electron is active, check atom button clicks first
    if (vis.selectedVisual && vis.selectedVisual.name == "electron") {
        if (controls.playbackButton.hitCheck()) return;
        vis.selectedVisual.mousePressed();
        return; // ignore everything else
    }

    // ignore play/pause button normally
    if (controls.playbackButton.hitCheck()) return;

    // ignore GUI area
    if (gui && mouseX > width - 270 && mouseY < 400) return;

    controls.mousePressed();
}

// keyPressed - delegates to controls and visualisations as needed 
function keyPressed() {
    controls.keyPressed(keyCode);

    if (vis.selectedVisual && vis.selectedVisual.name == "electron") {
        vis.selectedVisual.keyPressed(key);
    }
}

// windowResized - resizes the canvas and tells visualisations to recalculate layout if needed 
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    electronLayer.resizeCanvas(windowWidth, windowHeight);

    /* Start of my own code */
    // tell each visualisation that the window has changed size
    // so they can recalculate their layout (e.g. GUI panel position)
    for (var i = 0; i < vis.visuals.length; i++) {
        if (vis.visuals[i].onResize) {
            vis.visuals[i].onResize();
        }
    }
    /* End of my own code */
}
