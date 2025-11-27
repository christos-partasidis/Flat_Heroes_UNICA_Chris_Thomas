// SoundManager.js
class SoundManager {
  constructor() {
    // Check if Howler is loaded
    if (typeof Howl === "undefined") {
      console.warn("Howler.js not found! Sounds won't play.");
      return;
    }

    this.sounds = {
      jump: new Howl({
        src: ["assets/sounds/jump.wav"],
        volume: 0.5,
      }),
      dash: new Howl({
        src: ["assets/sounds/dash.wav"],
        volume: 0.3,
      }),
      hit: new Howl({
        src: ["assets/sounds/hit.wav"],
        volume: 0.8,
      }),
      // Background music
      bgm: new Howl({
        src: ["assets/sounds/music.mp3"], // You need a music file
        html5: true, // Good for large files (music)
        loop: true,
        volume: 0.4,
      }),
    };
  }

  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].play();
    }
  }

  stop(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].stop();
    }
  }
}

export default new SoundManager(); // Export a single instance (Singleton)
