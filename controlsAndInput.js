//Constructor function to handle the onscreen menu, keyboard and mouse
//controls
function ControlsAndInput(){
    
    this.menuDisplayed = true;
    
    //playback button displayed in the top left of the screen
    this.playbackButton = new PlaybackButton();

    /* Start of my own code */
    // track dropdown in the centre of the screen so the user can pick a song
    var trackPanel = QuickSettings.create(windowWidth/2 - 100, 15, "Select Audio Track");
    trackPanel.addDropDown("Track", trackNames, function(selected) {
        switchTrack(selected.index);
    });
    /* End of my own code */

    //make the window fullscreen or revert to windowed
    this.mousePressed = function(){
        // ignore clicks inside the track dropdown panel
        if (mouseX > windowWidth/2 - 100 && mouseX < windowWidth/2 + 100 && mouseY > 15 && mouseY < 80) return;

        // Check if the click is on the playback button
        if (!this.playbackButton.hitCheck()) {
            // If the click isn't on the button, toggle fullscreen
            let fs = fullscreen();
            fullscreen(!fs);
        }
        // If hitCheck() returns true, it already handled play/pause internally
    };

    //responds to keyboard presses
    //@param keycode the ascii code of the keypressed
    this.keyPressed = function(keycode){
        console.log(keycode);
        if(keycode == 32){//spacebar
            this.menuDisplayed = !this.menuDisplayed;
        }

        if(keycode > 48 && keycode < 58){//numbers 1-9
            var visNumber = keycode - 49;
            vis.selectVisual(vis.visuals[visNumber].name); 
        }
    };

    //draws the playback button and potentially the menu
    this.draw = function(){
        push();
        fill("white");
        stroke("black");
        strokeWeight(2);
        textSize(34);

        //playback button 
        this.playbackButton.draw();
        //only draw the menu if menu displayed is set to true.
        if(this.menuDisplayed){
            text("Select a visualisation:", 100, 30);
            this.menu();
            textSize(16);
            fill("white");
            text("Press SPACE to toggle menu", 100, 70 + (vis.visuals.length * 40) + 10);
        }   
        pop();
    };

    this.menu = function(){
        //draw out menu items for each visualisation
        for (var i = 0; i < vis.visuals.length; i++){
            if(vis.visuals[i] === vis.selectedVisual){
            fill("blue");
        } else {
            fill("white");
        }
            text((i + 1) + ": " + vis.visuals[i].name, 100, 70 + (i * 40));
        }
    };
}
