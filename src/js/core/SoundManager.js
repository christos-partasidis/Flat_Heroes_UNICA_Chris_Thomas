// SoundManager.js
class SoundManager {
  constructor() {
    // Check if Howler is loaded
    if (typeof Howl === "undefined") {
      console.warn("Howler.js not found! Sounds won't play.");
      return;
    }

    // Volume settings
    this.volumes = {
      master: 1.0,
      music: 0.4,
      sfx: 0.5,
    };

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

  setVolume(type, value){
    value = Math.max(0, Math.min(1, value));

    if (type == 'master'){
      this.volumes.master = value;
      this.updateAllVolumes();
    } else if(type === 'music'){
      this.volumes.music = value;
      this.sounds.bgm.volume(this.volumes.music * this.volumes.master);
    } else if (type === 'sfx') {
      this.volumes.sfx = value;
      this.sounds.jump.volume(this.volumes.sfx * this.volumes.master);
      this.sounds.dash.volume(this.volumes.sfx * this.volumes.master * 0.6);
      this.sounds.hit.volume(this.volumes.sfx * this.volumes.master * 1.6);
    }
  }
    updateAllVolumes() {
    this.sounds.bgm.volume(this.volumes.music * this.volumes.master);
    this.sounds.jump.volume(this.volumes.sfx * this.volumes.master);
    this.sounds.dash.volume(this.volumes.sfx * this.volumes.master * 0.6);
    this.sounds.hit.volume(this.volumes.sfx * this.volumes.master * 1.6);
  }

  getVolume(type) {
    return this.volumes[type] || 1.0;
  }
}

export default new SoundManager();
