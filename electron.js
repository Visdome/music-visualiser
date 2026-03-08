/* Start of my own code */

function Electron(layer) {
    this.name = "electron";

    // one rotation angle per shell - each shell rotates at a slightly different speed
    let shellAngles = [0, 0, 0, 0];

    //Rotation control variables
    let rotationEnabled = false;
    let userRotX = 0;
    let userRotY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;

    //Message display variables
    let message = "";
    let messageTimer = 0;

    // dial config
    let shakeX = 0;
    let shakeY = 0;

    // atom config
    // each atom stores its name, proton count, neutron count, and shells
    // shells is an array of electron counts per shell
    let atoms = [
        { name: "Hydrogen",  protons: 1,  neutrons: 0,  shells: [1] },
        { name: "Carbon",    protons: 6,  neutrons: 6,  shells: [2, 4] },
        { name: "Sodium",    protons: 11, neutrons: 12, shells: [2, 8, 1] },
        { name: "Calcium",   protons: 20, neutrons: 20, shells: [2, 8, 8, 2] }
    ];

    // start on Carbon
    let currentAtomIndex = 1;

    this.getCurrentAtomName = function() {
        return atoms[currentAtomIndex].name;
    };

    // electron particle constructor - each electron has its own trail history 
    // stores trail history for each orbiting electron
    function ElectronParticle() {
        this.trail = []; // array of {x, y, z} positions
        this.maxTrail = 10; // how many trail points to keep

        // add a new position to the trail
        this.addPoint = function(x, y, z) {
            this.trail.push({ x: x, y: y, z: z });
            // remove oldest point if trail is too long
            if (this.trail.length > this.maxTrail) {
                this.trail.shift();
            }
        };

        // draw the fading trail spheres
        this.drawTrail = function(g, electronSize) {
            for (let t = 0; t < this.trail.length; t++) {
                let alpha = map(t, 0, this.trail.length, 0, 120);
                let size = map(t, 0, this.trail.length, 2, electronSize * 0.7);
                g.push();
                g.translate(this.trail[t].x, this.trail[t].y, this.trail[t].z);
                g.noStroke();
                g.fill(0, 255, 255, alpha);
                g.sphere(size);
                g.pop();
            }
        };
    }

    // 2D array of ElectronParticle objects - one inner array per shell (4 shells),
    // each holding up to 8 particle trail objects (max electrons per shell)
    let shellParticles = [];
    for (let s = 0; s < 4; s++) {
        shellParticles[s] = [];
        for (let e = 0; e < 8; e++) {
            shellParticles[s].push(new ElectronParticle());
        }
    }

    // button layout for atom selector - drawn on the main canvas
    let btnW = 110;
    let btnH = 35;
    let btnX = 20;
    let btnStartY = 80;
    let btnGap = 45;

    // draw the atom selector buttons on the main canvas (not the WEBGL layer)
    this.drawButtons = function() {
        push();
        textSize(14);
        textAlign(CENTER, CENTER);

        fill(255);
        noStroke();
        text("Select Atom:", btnX + btnW / 2, btnStartY - 20);

        for (let i = 0; i < atoms.length; i++) {
            let bx = btnX;
            let by = btnStartY + i * btnGap;

            // highlight the currently selected atom
            if (i === currentAtomIndex) {
                fill(0, 200, 255);
                stroke(255);
            } else {
                fill(40, 40, 80);
                stroke(100, 100, 200);
            }

            strokeWeight(1);
            rect(bx, by, btnW, btnH, 6);

            fill(255);
            noStroke();
            text(atoms[i].name, bx + btnW / 2, by + btnH / 2);
        }
        pop();
    };

    // check if a button was clicked and switch atom if so
    this.mousePressed = function() {
        for (let i = 0; i < atoms.length; i++) {
            let bx = btnX;
            let by = btnStartY + i * btnGap;
            if (mouseX > bx && mouseX < bx + btnW && mouseY > by && mouseY < by + btnH) {
                currentAtomIndex = i;
                message = atoms[i].name + " selected";
                messageTimer = 120;
            }
        }
    };

    // setupGUI is kept so the visualisations system doesn't break
    // but we don't use the gui library for this visualisation
    this.setupGUI = function() {
        if (gui) gui.hide();
    };

    this.updateLayer = function(newLayer) {
        layer = newLayer;
    };

    this.toggleRotation = function() {
        rotationEnabled = !rotationEnabled;
        message = rotationEnabled ? "Rotation enabled" : "Rotation disabled";
        messageTimer = 120;
    };

    this.isRotationEnabled = function() {
        return rotationEnabled;
    };

    this.keyPressed = function(k) {
        if (k == 'r' || k == 'R') {
            this.toggleRotation();
        }
    };

    this.handleMouseMove = function() {
        if (!rotationEnabled) return;

        if (lastMouseX === 0 && lastMouseY === 0) {
            lastMouseX = mouseX;
            lastMouseY = mouseY;
            return;
        }

        let dx = mouseX - lastMouseX;
        let dy = mouseY - lastMouseY;

        userRotY += dx * 0.008;
        userRotX += dy * 0.008;

        lastMouseX = mouseX;
        lastMouseY = mouseY;
    };

    this.getMessage = function() {
        return message;
    };

    this.getMessageTimer = function() {
        return messageTimer;
    };

    this.decrementMessageTimer = function() {
        if (messageTimer > 0) {
            messageTimer--;
        }
    };

    this.draw = function() {
        let g = layer;
        let atom = atoms[currentAtomIndex];

        this.handleMouseMove();

        g.clear();
        g.background(0, 0, 0, 0);

        let bass = fft.getEnergy("bass");
        let mid = fft.getEnergy("mid");
        let treble = fft.getEnergy("treble");

        let protonSize = 15 + bass / 25;
        let neutronSize = 15 + mid / 25;
        let electronSize = 10 + treble / 80;

        // bass shake - offset the whole scene slightly on big bass hits
        if (bass > 200) {
            shakeX = random(-6, 6);
            shakeY = random(-6, 6);
        } else {
            // settle back to centre
            shakeX *= 0.8;
            shakeY *= 0.8;
        }

        g.push();
        g.translate(shakeX, shakeY, 0);

        let atomScale = min(g.width, g.height) / (370 * 2) * 0.7;
        g.scale(atomScale);

        // auto rotation
        g.rotateY(frameCount * 0.002);
        g.rotateX(frameCount * 0.001);

        // user rotation
        g.rotateX(userRotX);
        g.rotateY(userRotY);

        // nucleus
        this.drawNucleus(g, protonSize, neutronSize, atom, bass);

        // draw shells based on current atom's shell config
        let shellRadii = [135, 225, 300, 370];

        for (let s = 0; s < atom.shells.length; s++) {
            let radius = shellRadii[s];
            let electronCount = atom.shells[s];
            // get the rotation angle for this specific shell
            let angleOffset = shellAngles[s];

            // pass the matching row from the 2D shellParticles array
            this.drawOrbitShell(g, radius, angleOffset, electronCount, electronSize, mid, shellParticles[s]);
        }

        g.pop();

        // each shell has its own rotation speed stored in this array
        // forEach loops over each speed and adds it to the matching shell angle
        let shellSpeeds = [450, 600, 800, 1000];
        shellSpeeds.forEach(function(speed, index) {
            shellAngles[index] += treble / speed;
        });
    };

    this.drawNucleus = function(g, protonSize, neutronSize, atom, bass) {
        // fixed positions for nucleus particles, shared between protons and neutrons
        let positions = [[0, 0, 0],[18, 0, 0],[9, 15, 0],[9, 7, 13],[-9, -7, 13],
            [-9, -7, -13],[9, -15, 0],[-18, 0, 0],[0, 15, -13],[18, 0, -18],
            [-9, 15, -7],[9, -7, -13],[-9, 7, -13],[0, -15, 13],[18, 7, 0],
            [9, -7, 18],[-18, 7, 0],[-9, 15, 7],[0, -15, -13],[-18, 0, 13]
        ];

        let total = min(atom.protons + atom.neutrons, positions.length);

        // glow effect on bass hit - draw a big transparent sphere around nucleus
        if (bass > 180) {
            let glowSize = map(bass, 180, 255, 30, 60);
            g.push();
            g.noStroke();
            g.fill(255, 60, 60, map(bass, 180, 255, 20, 60));
            g.sphere(glowSize);
            g.pop();
        }
        // draw protons and neutrons at their fixed positions, colouring protons based on bass energy
        for (let i = 0; i < total; i++) {
            let pos = positions[i % positions.length];
            let x = pos[0];
            let y = pos[1];
            let z = pos[2];

            g.push();
            g.translate(x, y, z);
            g.noStroke();
            // protons glow brighter on bass, neutrons react to mid frequencies
            if (i < atom.protons) {
                // protons glow brighter on bass
                let r = map(bass, 0, 255, 200, 255);
                g.fill(r, 80, 80);   // red for protons, reacts to bass
                g.sphere(protonSize);
            } else {
                g.fill(100, 150, 255);  // blue for neutrons, reacts to mid
                g.sphere(neutronSize);
            }

            g.pop();
        }
    };
    // draw a single electron shell with its orbiting electrons and trails
    this.drawOrbitShell = function(g, radius, angleOffset, electronCount, electronSize, mid, particles) {
        g.push();
        g.rotateX(HALF_PI);

        // shell ring colour reacts to mid frequency
        let ringG = map(mid, 0, 255, 100, 255);
        let ringB = map(mid, 0, 255, 255, 100);

        // shell ring
        g.noFill();
        g.stroke(100, ringG, ringB);
        g.strokeWeight(2);
        g.beginShape();
        for (let a = 0; a <= TWO_PI; a += 0.01) {
            g.vertex(cos(a) * radius, sin(a) * radius, 0);
        }
        g.endShape();

        // electrons and their trails
        g.noStroke();
        g.fill(0, 255, 255);
        for (let i = 0; i < electronCount; i++) {
            let ea = angleOffset + TWO_PI * i / electronCount;
            let ex = cos(ea) * radius;
            let ey = sin(ea) * radius;

            // update this electron's trail
            if (particles[i]) {
                particles[i].addPoint(ex, ey, 0);
                particles[i].drawTrail(g, electronSize);
            }

            // draw the electron itself
            g.push();
            g.translate(ex, ey, 0);
            g.sphere(electronSize);   // reacts to treble
            g.pop();
        }

        g.pop();
    };
}
/* End of my own code */
