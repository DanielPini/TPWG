class TitleScreen {
  constructor({ progress }) {
    this.progress = progress;
  }

  startMusic(src) {
    // Ensure that the music isn't restarted unnecessarily
    if (window.lastMusicSrc === src) {
      console.log("Music is already playing:", src);
      return; // Exit early if the same music is already playing
    }

    if (window.currentMusic) {
      console.log("Stopping current music.");
      window.currentMusic.stop();
    }

    console.log("Starting music:", src);
    window.currentMusic = new Howl({
      src: [src],
      loop: true,
      volume: window.audioSettings.muted ? 0 : window.audioSettings.volume,
      onend: () => {
        console.log("Music ended");
        // After the music ends, mark that the music has stopped playing
        window.lastMusicSrc = null;
      },
    });

    window.currentMusic.play();
    window.lastMusicSrc = src; // Store the current music source
  }

  getOptions(resolve) {
    const safeFile = this.progress.getSaveFile();
    const musicSrc = safeFile
      ? this.progress.getMusicForMap(safeFile.mapId)
      : "./audio/We_Song_entryway-audio.mp3"; // Default music if no save file

    return [
      {
        label: "New Game",
        description: "Explore the world of The Parts We Give.",
        handler: () => {
          this.close();
          this.startMusic(musicSrc);
          resolve();
        },
      },
      safeFile
        ? {
            label: "Continue Game",
            description: "Resume your adventure",
            handler: () => {
              this.close();
              this.startMusic(musicSrc);
              resolve(safeFile);
            },
          }
        : null,
    ].filter((v) => v);
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("TitleScreen");
    this.element.innerHTML = `
      <img class="TitleScreen_logo" src="./images/TPWGTitle.png" alt="The Parts We Give Title Page" />
    `;
  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
  }

  init(container) {
    return new Promise((resolve) => {
      this.createElement();
      container.appendChild(this.element);
      this.keyboardMenu = new KeyboardMenu();
      this.keyboardMenu.init(this.element);
      this.keyboardMenu.setOptions(this.getOptions(resolve));
    });
  }
}
