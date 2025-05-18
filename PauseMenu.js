class PauseMenu {
  constructor({ progress, map, onComplete }) {
    this.progress = progress;
    this.map = map;
    this.onComplete = onComplete;
  }

  getOptions(pageKey) {
    //Case 1: Show the first page of options
    if (pageKey === "root") {
      return [
        {
          label: "Sound Options",
          description: "Adjust mute and volume",
          handler: () => {
            this.keyboardMenu.setOptions(this.getSoundOptions());
          },
        },
        {
          label: "Change Player",
          description: "Change the player character",
          handler: () => {
            this.keyboardMenu.setOptions(this.getCharacterOptions());
          },
        },
        {
          label: "Save",
          description: "Save your progress",
          handler: () => {
            this.progress.save();
            this.close();
          },
        },
        {
          label: "Close",
          description: "Close the pause menu",
          handler: () => {
            this.close();
          },
        },
      ];
    }

    //Case 2: Show the options for just one pizza (by id)
    const unequipped = Object.keys(playerState.pizzas)
      .filter((id) => {
        return playerState.lineup.indexOf(id) === -1;
      })
      .map((id) => {
        const { pizzaId } = playerState.pizzas[id];
        const base = Pizzas[pizzaId];
        return {
          label: `Swap for ${base.name}`,
          description: base.description,
          handler: () => {
            playerState.swapLineup(pageKey, id);
            this.keyboardMenu.setOptions(this.getOptions("root"));
          },
        };
      });

    return [
      ...unequipped,
      {
        label: "Move to front",
        description: "Move this pizza to the front of the list",
        handler: () => {
          playerState.moveToFront(pageKey);
          this.keyboardMenu.setOptions(this.getOptions("root"));
        },
      },
      {
        label: "Back",
        description: "Back to root menu",
        handler: () => {
          this.keyboardMenu.setOptions(this.getOptions("root"));
        },
      },
    ];
  }

  getSoundOptions() {
    return [
      {
        label: window.audioSettings.isMuted ? "Unmute" : "Mute",
        description: window.audioSettings.isMuted
          ? "Currently muted. Click to unmute."
          : "Currently unmuted. Click to mute.",
        handler: () => {
          window.audioSettings.isMuted = !window.audioSettings.isMuted;
          localStorage.setItem(
            "audioSettings",
            JSON.stringify(window.audioSettings)
          );
          Howler.mute(window.audioSettings.isMuted);
          this.keyboardMenu.setOptions(this.getSoundOptions()); // Refresh menu
        },
      },
      {
        label: "Volume Up",
        description: "Increase volume by 10%",
        handler: () => {
          let newVolume = Math.min(1, window.audioSettings.volume + 0.1);
          window.audioSettings.volume = newVolume;
          localStorage.setItem(
            "audioSettings",
            JSON.stringify(window.audioSettings)
          );
          Howler.volume(newVolume);
          this.keyboardMenu.setOptions(this.getSoundOptions()); // Refresh menu
        },
      },
      {
        label: "Volume Down",
        description: "Decrease volume by 10%",
        handler: () => {
          let newVolume = Math.max(0, window.audioSettings.volume - 0.1);
          window.audioSettings.volume = newVolume;
          localStorage.setItem(
            "audioSettings",
            JSON.stringify(window.audioSettings)
          );
          Howler.volume(newVolume);
          this.keyboardMenu.setOptions(this.getSoundOptions()); // Refresh menu
        },
      },
      {
        label: `Current Volume: ${(window.audioSettings.volume * 100).toFixed(
          0
        )}%`,
        description: window.audioSettings.isMuted ? "Muted" : "Sound On",
        handler: () => {},
      },
      {
        label: "Back",
        description: "Return to main menu",
        handler: () => {
          this.keyboardMenu.setOptions(this.getOptions("root"));
        },
      },
    ];
  }

  getCharacterOptions() {
    return [
      {
        label:
          playerState.sisterUnlocked &&
          playerState.character.toLowerCase() == "brother"
            ? "Sister"
            : "Brother",
        description: "Change player character",
        handler: () => {
          playerState.changeCharacter();
          this.close();

          setTimeout(() => {
            const newHero = new Person({
              ...this.map.configObjects.hero, // Base config
              src: `/images/characters/people/${playerState.character}.png`,
            });
            this.map.gameObjects.hero = newHero;
            newHero.id = "hero";
            newHero.mount(this.map);
            // this.map.refreshGameObjects();
          }, 10); // Add a small delay to ensure pause menu has fully closed
        },
      },
    ];
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("PauseMenu");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = `
      <h2>Pause Menu</h2>
    `;
  }

  close() {
    this.esc?.unbind();
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  async init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container,
    });
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));

    container.appendChild(this.element);

    utils.wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    });
  }
}
