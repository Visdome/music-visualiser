/* Start of my own code */

// TrackManager handles loading and switching between audio tracks.
// Keeping this logic in its own constructor keeps sketch.js cleaner
// and groups all track-related code in one place.
function TrackManager(fft) {

    // the list of track names shown in the dropdown
    let names = ["pop-edm", "instrumental", "deception", "Stomper Reggae"];

    // all loaded sound objects are stored in this array
    let tracks = [];

    // which track is currently active
    let currentIndex = 0;

    // load all tracks and return the array so preload() can use it
    this.loadTracks = function() {
        tracks[0] = loadSound('assets/pop-edm.mp3');
        tracks[1] = loadSound('assets/instrumental.mp3');
        tracks[2] = loadSound('assets/deception.mp3');
        tracks[3] = loadSound('assets/stomper_reggae_bit.mp3');
        return tracks;
    };

    // returns the currently playing sound object
    this.getCurrentSound = function() {
        return tracks[currentIndex];
    };

    // returns the array of track names (used by the dropdown)
    this.getNames = function() {
        return names;
    };

    // switches to a new track by index.
    // if music was already playing, the new track starts automatically.
    this.switchTo = function(index, playbackButton) {
        let wasPlaying = tracks[currentIndex].isPlaying();
        tracks[currentIndex].stop();
        currentIndex = index;
        fft.setInput(tracks[currentIndex]);
        if (wasPlaying) {
            tracks[currentIndex].loop();
            // keep the playback button in sync
            playbackButton.playing = true;
        }
    };
}

/* End of my own code */
