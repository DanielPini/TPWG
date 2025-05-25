class Progress {
  constructor() {
    this.mapId = "Home";
    this.startingHeroX = 0;
    this.startingHeroY = 0;
    this.startingHeroDirection = "down";
    this.saveFileKey = "PizzaLegends_SaveFile1";
  }

  // Method to retrieve music based on the current map
  getMusicForMap(mapId) {
    const musicMap = {
      // LivingRoom: "./audio/Sounds_of_my_house_at_seven_living-audio.mp3",
      // Kitchen: "./audio/Lao_Gan_Ma_kitchen-audio.mp3",
      Kid: "./audio/Timestables_kid-audio.mp3",
      // Balcony: "./audio/JieJie_balcony-audio.mp3",
      // Entrance: "./audio/We_Song_entryway-audio.mp3",
      // Dining: "./audio/Barangaroo_Baby_dining-audio.mp3",
      // Add more maps and corresponding music here
    };
    return musicMap[mapId] || "./audio/We_Song_entryway-audio.mp3"; // Default music if no match
  }

  save() {
    window.localStorage.setItem(
      this.saveFileKey,
      JSON.stringify({
        mapId: this.mapId,
        startingHeroX: this.startingHeroX,
        startingHeroY: this.startingHeroY,
        startingHeroDirection: this.startingHeroDirection,
        playerState: {
          pizzas: playerState.pizzas,
          lineup: playerState.lineup,
          items: playerState.items,
          storyFlags: playerState.storyFlags,
        },
      })
    );
  }

  getSaveFile() {
    if (!window.localStorage) {
      return null;
    }

    const file = window.localStorage.getItem(this.saveFileKey);
    if (!file) return null;
    try {
      const parsed = JSON.parse(file);
      // Check for required properties to confirm it's a valid save
      if (parsed && parsed.mapId && parsed.playerState) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  load() {
    const file = this.getSaveFile();
    if (file) {
      this.mapId = file.mapId;
      this.startingHeroX = file.startingHeroX;
      this.startingHeroY = file.startingHeroY;
      this.startingHeroDirection = file.startingHeroDirection;
      Object.keys(file.playerState).forEach((key) => {
        playerState[key] = file.playerState[key];
      });
    }
  }
}
