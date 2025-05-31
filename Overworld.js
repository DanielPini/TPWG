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
    let cameraPerson;
    if (this.inChopFruitRoom) {
      cameraPerson = { x: 168, y: 96, direction: "down" };
    } else {
      cameraPerson = this.map.gameObjects.hero || {
        x: 0,
        y: 0,
        direction: "down",
      };
    }
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

    // Draw target highlight if active
    if (
      this.questManager &&
      this.questManager.activeQuests &&
      this.questManager.activeQuests["mediationQuest"]
    ) {
      const runner = this.questManager.activeQuests["mediationQuest"].runner;
      if (runner && runner.currentTarget) {
        // Convert pixel to grid for easier reading
        const heroGrid = {
          x: Math.round(cameraPerson.x / 16),
          y: Math.round(cameraPerson.y / 16),
        };
        const targetGrid = {
          x: Math.round(runner.currentTarget.x / 16),
          y: Math.round(runner.currentTarget.y / 16),
        };
        if (runner.targetHighlightActive && runner.currentTarget) {
          this.map.drawTargetHighlight(
            this.ctx,
            runner.currentTarget,
            cameraPerson
          );
        }
      }
    }

    if (this.map.gameObjects["table"]) {
      this.map.gameObjects["table"].draw(this.ctx, cameraPerson);
    }

    //Draw Game Objects
    Object.values(this.map.gameObjects)
      .sort((a, b) => a.y - b.y)
      .forEach((object) => {
        if (object.sprite) {
          object.sprite.draw(this.ctx, cameraPerson);
        }
        if (
          typeof object.draw === "function" &&
          object !== object.sprite &&
          object.type !== "Table"
        )
          object.draw(this.ctx, cameraPerson);
      });

    // Draw temporary pickup sprite
    if (this.map.tempPickupSprite) {
      const elapsed = performance.now() - this.map.tempPickupSprite.startTime;
      if (elapsed < this.map.tempPickupSprite.duration) {
        this.map.tempPickupSprite.sprite.drawAt(
          this.ctx,
          this.map.tempPickupSprite.who.x,
          this.map.tempPickupSprite.who.y - 16, // adjust offset as needed
          cameraPerson
        );
      } else {
        this.map.tempPickupSprite = null;
      }
    }

    //Draw Upper layer
    this.map.drawUpperImage(this.ctx, cameraPerson);
  }

  startGameLoop() {
    let previousMs;
    const step = 1 / 50;

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
    new KeyPressListener("KeyV", () => {
      window.audioSettings.muted = !window.audioSettings.muted;
      Howler.mute(window.audioSettings.muted);

      // Update in localstorage
      localStorage.setItem(
        "audioSettings",
        JSON.stringify(window.audioSettings)
      );
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

  startMediationQuest(quest) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      window.playerState.character = "sister";
      this.startMap("HomeMediation", window.playerState.character);

      const hero = this.map.gameObjects.hero;
      if (hero) {
        // Reset all animation-related flags
        hero.lockedAnimation = null;
        hero.isChopping = false;
        hero.isSitting = false;
        hero.isPickingUp = false;
        hero.sprite.setAnimation("idle-" + hero.direction);
        hero.sprite.currentAnimationFrame = 0;
        hero.sprite.animationFrameProgress = hero.sprite.animationFrameLimit;
        hero.x = utils.withGrid(2);
        hero.y = utils.withGrid(7);
        hero.direction = "up";
      }
      this.map.isPaused = false; // Ensure game loop is running
      console.log(this.map.isPaused);

      const runner = new MediationQuestRunner({
        quest,
        overworld: this,
      });

      if (
        this.questManager &&
        this.questManager.activeQuests &&
        this.questManager.activeQuests["mediationQuest"]
      ) {
        this.questManager.activeQuests["mediationQuest"].runner = runner;
      }
      runner.start();
      setTimeout(() => {
        sceneTransition.fadeOut();
      }, 0);
    });
  }

  startChopFruitQuest(quest) {
    const sceneTransition = new SceneTransition();
    const originalMapId = this.progress.mapId;
    const hero = this.map.gameObjects.hero;
    const originalHeroState = hero
      ? { x: hero.x, y: hero.y, direction: hero.direction }
      : null;

    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.startMap("ChopRoom", "sister");
      this.inChopFruitRoom = true;
      const chopRoom = new ChopFruitRoom({
        quest,
        onComplete: () => {
          this.map.isPaused = false;
          this.questManager.completeQuest("chopFruit");
          // Transition back to the original map
          const returnTransition = new SceneTransition();
          returnTransition.init(
            document.querySelector(".game-container"),
            () => {
              this.startMap(
                originalMapId,
                window.playerState.character,
                originalHeroState
              );
              setTimeout(() => {
                returnTransition.fadeOut();
                this.inChopFruitRoom = false;
                this.questManager.startQuest("mediationQuest");
              }, 0);
              // requestAnimationFrame(() => {
              //   returnTransition.fadeOut();
              // });
            }
          );
        },
      });
      chopRoom.start(document.querySelector(".game-container"));
      this.map.handleMusicEvent({
        src: "./audio/JieJie_balcony-audio.mp3",
        loop: true,
      });
      setTimeout(() => {
        sceneTransition.fadeOut();
      }, 0);
      // requestAnimationFrame(() => {
      //   sceneTransition.fadeOut();
      // });
    });
  }

  startMap(mapId, character, heroInitialState = null) {
    const mapInstance = window.OverworldMaps[mapId].createInstance(character);
    this.map = mapInstance;
    this.map.overworld = this;
    // this.map.mountObjects();
    this.map.triggerLoadCutscenes();

    if (!this.questManager) {
      this.questManager = new QuestManager({
        overworld: this,
        onQuestEnd: (questId) => {
          this.questTimer.stop();
        },
      });
    }
    this.questManager.setMap(this.map);
    // this.map.mountObjects(this);

    this.map.spawnActiveQuestObjects();

    if (heroInitialState) {
      const { hero } = this.map.gameObjects;
      if (hero) {
        hero.x = heroInitialState.x;
        hero.y = heroInitialState.y;
        hero.direction = heroInitialState.direction;
      }
    }

    this.progress.mapId = mapId;

    const hero = this.map.gameObjects.hero;
    this.progress.startingHeroX = hero ? hero.x : 0;
    this.progress.startingHeroY = hero ? hero.y : 0;
    this.progress.startingHeroDirection = hero ? hero.direction : "down";

    if (
      playerState.character === "sister" &&
      playerState.sisterUnlocked &&
      !playerState.storyFlags.SISTER_INTRO_CUTSCENE
    ) {
      playerState.storyFlags.SISTER_INTRO_CUTSCENE = true; // Prevent repeat
      this.map
        .startCutscene([
          { type: "chop", who: "hero", direction: "right", time: 2200 },
          {
            type: "textMessage",
            who: "Mum",
            text: "Here, try this Didi!",
          },
          { type: "chop", who: "hero", direction: "right", time: 2200 },
          {
            type: "textMessage",
            who: "Jiejie",
            text: "You always give the fatty piece of ro (meat) to Didi",
          },
          {
            type: "walk",
            who: "Didi",
            direction: "left",
          },
          {
            type: "walk",
            who: "Didi",
            direction: "left",
          },
          {
            type: "walk",
            who: "Didi",
            direction: "left",
          },
          {
            type: "walk",
            who: "Mum",
            direction: "up",
          },
          {
            type: "walk",
            who: "Mum",
            direction: "up",
          },
          {
            type: "walk",
            who: "Mum",
            direction: "up",
          },
          {
            type: "walk",
            who: "Mum",
            direction: "up",
          },
          {
            type: "walk",
            who: "Mum",
            direction: "up",
          },
          {
            type: "textMessage",
            who: "Mum",
            text: "Because he is a growing boy.",
          },
          {
            type: "stand",
            who: "hero",
            direction: "down",
          },
          {
            type: "textMessage",
            who: "Mum",
            text: "Plus, we ladies have to watch our figures.",
          },
          {
            type: "textMessage",
            who: "Mum",
            text: "I'm getting pun (fat) the older I get",
          },
          {
            type: "textMessage",
            who: "Jiejie",
            text: "...",
          },
          {
            type: "stand",
            who: "hero",
            direction: "right",
          },
          { type: "chop", who: "hero", direction: "right", time: 2200 },
          {
            type: "textMessage",
            who: "Mum",
            text: "I have my hands full, can you cut up some fruit for the guests and pack some for Didi's Fruito tomorrow?",
          },
          {
            type: "walk",
            who: "Mum",
            direction: "down",
          },
          {
            type: "walk",
            who: "Mum",
            direction: "down",
          },
          {
            type: "walk",
            who: "Mum",
            direction: "down",
          },
          {
            type: "walk",
            who: "Mum",
            direction: "down",
          },
          {
            type: "walk",
            who: "Mum",
            direction: "down",
          },
          { type: "chop", who: "hero", direction: "right", time: 3000 },
          {
            type: "textMessage",
            text: "I build my own walkls, brick by brick, made of expectations.",
          },
          {
            type: "textMessage",
            text: "Each step I take, each breath I draw, until I can give an answer.",
          },
          { type: "chop", who: "hero", direction: "right", time: 2200 },
        ])
        .then(() => {
          this.questManager.startQuest("mediationQuest");
        });
    }
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

  showTitleScreen() {
    this.map.isPaused = true;
    this.titleScreen = new TitleScreen({
      progress: this.progress,
    });
    this.titleScreen
      .init(document.querySelector(".game-container"))
      .then((useSaveFile) => {
        // Optionally reset state here
        let initialHeroState = null;
        if (useSaveFile) {
          this.progress.load();
          initialHeroState = {
            x: this.progress.startingHeroX,
            y: this.progress.startingHeroY,
            direction: this.progress.startingHeroDirection,
          };
        }
        this.startMap(
          this.progress.mapId,
          window.playerState.character,
          initialHeroState
        );
        this.map.isPaused = false;
        // Re-bind controls if needed
        this.bindActionInput();
        this.bindHeroPositionCheck();
        if (!this.directionInput) {
          this.directionInput = new DirectionInput();
          this.directionInput.init();
        }
        this.startGameLoop();
      });
  }

  async init() {
    const container = document.querySelector(".game-container");

    //Create a new Progress tracker
    this.progress = new Progress();

    /**
     * For Dev purposes
     */
    // this.startMap("Home", window.playerState.character);
    // this.startChopFruitQuest(window.Quests.chopFruit);
    // return;

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
    //Start the first map
    this.startMap(this.progress.mapId, window.playerState.character);

    //Create controls
    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    if (!playerState.storyFlags.SEEN_INTRO) {
      new WelcomeMessage({
        map: this.map, // Pass the map instance
        onComplete: () => {
          playerState.storyFlags.SEEN_INTRO = true;
          this.startGameLoop();
        },
      }).init();
    } else {
      //Kick off the game!
      this.startGameLoop();
    }
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
