class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
    this.questTimer = new QuestTimer();
  }

  gameLoopStepWork(delta) {
    //Clear off the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //Establish the camera person
    const cameraPerson = this.map.gameObjects.hero;
    //Update all objects
    Object.values(this.map.gameObjects).forEach((object) => {
      object.update({
        delta,
        arrow: this.directionInput.direction,
        map: this.map,
      });
    });

    //Draw Lower layer
    this.map.drawLowerImage(this.ctx, cameraPerson);

    //Draw Game Objects
    Object.values(this.map.gameObjects)
      .sort((a, b) => {
        return a.y - b.y;
      })
      .forEach((object) => {
        object.sprite.draw(this.ctx, cameraPerson);
      });

    //Draw Upper layer
    this.map.drawUpperImage(this.ctx, cameraPerson);
  }

  startGameLoop() {
    let previousMs;
    const step = 1 / 60;

    const stepFn = (timestampMs) => {
      // Stop here if paused
      if (this.map.isPaused) {
        return;
      }
      if (previousMs === undefined) {
        previousMs = timestampMs;
      }

      let delta = (timestampMs - previousMs) / 1000;
      while (delta >= step) {
        this.gameLoopStepWork(delta);
        delta -= step;
      }
      previousMs = timestampMs - delta * 1000; // Make sure we don't lose unprocessed (delta) time
      this.questManager.update();

      // Business as usual tick
      requestAnimationFrame(stepFn);
    };

    // First tick
    requestAnimationFrame(stepFn);
  }

  bindActionInput() {
    new KeyPressListener("Enter", () => {
      //Is there a person here to talk to?
      this.map.checkForActionCutscene();
    });
    new KeyPressListener("Escape", () => {
      if (!this.map.isCutscenePlaying) {
        this.map.startCutscene([{ type: "pause" }]);
      }
    });
  }

  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", (e) => {
      if (e.detail.whoId === "hero") {
        //Hero's position has changed
        this.map.checkForFootstepCutscene();
      }
    });
  }

  startMap(mapId, character, heroInitialState = null) {
    const mapInstance = window.OverworldMaps[mapId].createInstance(character);
    this.map = mapInstance;
    this.map.overworld = this;
    this.map.mountObjects();
    this.map.triggerLoadCutscenes();

    if (!this.questManager) {
      this.questManager = new QuestManager({
        overworld: this,
        onQuestStart: (questId, quest) => {
          if (quest.timer) {
            this.questTimer.start(questId, quest.timer);
          }
        },
        onQuestEnd: (questId) => {
          this.questTimer.stop();
        },
      });
    }
    this.questManager.setMap(this.map);
    this.map.mountObjects(this);

    this.map.spawnActiveQuestObjects();

    if (heroInitialState) {
      const { hero } = this.map.gameObjects;
      hero.x = heroInitialState.x;
      hero.y = heroInitialState.y;
      hero.direction = heroInitialState.direction;
    }

    this.progress.mapId = mapId;
    const hero = this.map.gameObjects.hero;
    this.progress.startingHeroX = hero.x;
    this.progress.startingHeroY = hero.y;
    this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
  }

  addGameObject(config) {
    const Constructor = window.GameObjectClasses[config.type];
    if (!Constructor) {
      throw new Error(`Unknown GameObject type: ${config.type}`);
    }

    const gameObject = new Constructor(config);
    gameObject.id = config.id;

    if (typeof gameObject.mount === "function") {
      gameObject.mount(this.map);
    }
    // Attach to the current map
    this.map.gameObjects[config.id] = gameObject;
  }

  async init() {
    const container = document.querySelector(".game-container");

    //Create a new Progress tracker
    this.progress = new Progress();

    // Show the title screen
    this.titleScreen = new TitleScreen({
      progress: this.progress,
    });
    const useSaveFile = await this.titleScreen.init(container);
    // const useSaveFile = false;

    //Potentially load saved data
    let initialHeroState = null;
    if (useSaveFile) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection,
      };
    }

    //Load the HUD
    // this.hud = new Hud();
    // this.hud.init(container);
    this.startMap(this.progress.mapId, window.playerState.character);

    //Start the first map
    // this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

    //Create controls
    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    //Kick off the game!
    this.startGameLoop();

    // this.map.startCutscene([
    //   // { type: "battle", enemyId: "beth" }
    //   // { type: "changeMap", map: "DemoRoom"}
    //   { type: "textMessage", text: "This is the very first message!" },
    // ]);
  }
}

// In your global playerState (e.g., playerState.pickedUpQuestObjects = [])
window.playerState.pickedUpQuestObjects =
  window.playerState.pickedUpQuestObjects || [];
