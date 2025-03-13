(function () {
  const savedAudioSettings = JSON.parse(localStorage.getItem("audioSettings"));
  if (savedAudioSettings) {
    window.audioSettings = savedAudioSettings;
    Howler.volume(window.audioSettings.volume);
    Howler.mute(window.audioSettings.isMuted);
  } else {
    window.audioSettings = {
      volume: 0.5,
      muted: false,
    };
  }
  Howler.volume(window.audioSettings.volume);
  Howler.mute(window.audioSettings.isMuted);
  const overworld = new Overworld({
    element: document.querySelector(".game-container"),
  });
  overworld.init();
})();
