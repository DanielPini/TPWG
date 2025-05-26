class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior(
      {
        map: this.map,
      },
      {
        type: "stand",
        direction: this.event.direction,
        time: this.event.time,
      }
    );
    //Set up a handler to complete when correct person is done standing, then resolve the event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    };
    document.addEventListener("PersonStandComplete", completeHandler);
  }

  sit(resolve) {
    const who = this.map.gameObjects[this.event.who];

    who.startBehavior(
      {
        map: this.map,
      },
      {
        type: "sit",
        direction: this.event.direction,
        time: this.event,
      }
    );

    //Set up a handler to complete when correct person is done sitting, then resolve the event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonSitComplete", completeHandler);
        resolve();
      }
    };
    document.addEventListener("PersonSitComplete", completeHandler);
  }

  pickUpItem(resolve) {
    const who = this.map.gameObjects[this.event.who];
    const itemId = this.event.itemId;
    const itemType = this.event.itemType;

    if (!itemId || !itemType) {
      console.error("pickUpItem event missing itemId or itemType", this.event);
      return;
    }

    console.log(this.event);
    who.startBehavior(
      {
        map: this.map,
      },
      {
        type: "pickUpItem",
        direction: "down",
        itemId,
        itemType,
        time: this.event.time || 400,
      }
    );

    // Animate item above character
    const typeToImage = {
      NerfPile: "./images/objects/Nerf.png",
      Nerf: "./images/objects/Nerf.png",
      Plates: "./images/objects/Plates.png",
    };

    const itemSpriteSrc = typeToImage[itemType];

    // Create a temporary item sprite object
    const tempItem = new Sprite({
      gameObject: who,
      src: itemSpriteSrc,
      useShadow: false,
    });

    // Attach to map for rendering
    this.map.tempPickupSprite = {
      sprite: tempItem,
      who,
      startTime: performance.now(),
      duration: this.event.time || 400,
    };
    //Set up a handler to complete when correct person is done sitting, then resolve the event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonPickUpComplete", completeHandler);

        // Set direction if not already set
        const who = this.map.gameObjects[this.event.who];
        if (!who.direction) {
          who.direction = who.previousDirection || "down";
        }

        who.sprite.setAnimation("idle-" + who.direction);
        who.isPickingUp = false;
        resolve();
      }
    };
    document.addEventListener("PersonPickUpComplete", completeHandler);
  }

  startQuest(resolve) {
    const questId = this.event.questId;
    if (!questId) {
      console.warn(`Quest ID ${questId} not found.`);
      return;
    }
    console.log(`Quest started: ${questId}`);
    this.map.overworld.questManager.startQuest(questId);
    resolve();
  }

  startQuestTimer(resolve) {
    console.log("Starting quest timer event for quest:", this.event.questId);
    const questId = this.event.questId;
    const quest = this.map.overworld.questManager.questDefinitions[questId];
    if (quest && quest.timer) {
      // Start the timer for the quest
      this.map.overworld.questManager.timers[questId] = setTimeout(() => {
        this.map.overworld.questManager.failQuest(questId);
      }, quest.timer);
      // Also start the visual timer
      if (this.map.overworld.questTimer) {
        this.map.overworld.questTimer.start(
          questId,
          quest.timer,
          quest.milestones || []
        );
      }
    }
    resolve();
  }

  completeQuest(resolve) {
    const questId = this.event.questId;
    this.map.overworld.questManager.completeQuest(questId);
    resolve();
  }

  removeObjects(resolve) {
    const objectIds = this.event.ids || [];
    objectIds.forEach((id) => {
      delete this.map.gameObjects[id];
    });
    resolve();
  }

  unlockSister(resolve) {
    window.playerState.sisterUnlocked = true;
    resolve();
  }

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];
    const direction = this.event.direction;

    if (who.isPlayerControlled) {
      const maxRetries = 30;
      let retries = 0;

      const tryWalk = () => {
        // Only check for blocking during cutscenes
        if (!this.map.isSpaceTaken(who.x, who.y, direction, who.id)) {
          who.startBehavior(
            { map: this.map },
            { type: "walk", direction: this.event.direction, retry: true }
          );

          // Set up a handler to complete when correct person is done walking, then resolve the event
          const completeHandler = (e) => {
            if (e.detail.whoId === this.event.who) {
              document.removeEventListener(
                "PersonWalkingComplete",
                completeHandler
              );
              resolve();
            }
          };
          document.addEventListener("PersonWalkingComplete", completeHandler);
        } else {
          // Space is taken, try again after a short delay
          retries++;
          if (retries < maxRetries) {
            setTimeout(tryWalk, 100);
          } else {
            // Give up after too many retries to avoid infinite loop
            console.warn(
              `Cutscene walk for ${this.event.who} blocked after ${maxRetries} retries.`
            );
            resolve();
          }
        }
      };
      tryWalk();
    } else {
      who.startBehavior(
        {
          map: this.map,
        },
        {
          type: "walk",
          direction: this.event.direction,
          retry: true,
        }
      );

      //Set up a handler to complete when correct person is done walking, then resolve the event
      const completeHandler = (e) => {
        if (e.detail.whoId === this.event.who) {
          document.removeEventListener(
            "PersonWalkingComplete",
            completeHandler
          );
          resolve();
        }
      };
      document.addEventListener("PersonWalkingComplete", completeHandler);
    }
  }

  chop(resolve) {
    const who = this.map.gameObjects[this.event.who];
    if (!who) {
      console.error(
        `No gameObject found for key "${this.event.who}" in chop event.`
      );
      resolve();
      return;
    }
    if (this.event.direction) {
      who.direction = this.event.direction;
    }
    who.isChopping = true; // <-- Add this line
    console.log("Setting chop animation for", who.id, who.sprite);
    who.sprite.setAnimation("chop-right");
    setTimeout(() => {
      who.isChopping = false; // <-- Add this line
      who.sprite.setAnimation("idle-" + (who.direction || "right"));
      resolve();
    }, this.event.time || 1000);
  }

  textMessage(resolve) {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(
        this.map.gameObjects["hero"].direction
      );
    }

    let name = null;
    if (this.event.who) {
      const obj = this.map.gameObjects[this.event.who];
      // Use obj.name if defined, else fallback to id
      name = obj?.name || this.event.who;
    }
    const message = new TextMessage({
      text: this.event.text,
      name,
      onComplete: () => {
        console.log("TextMessage event resolved:", this.event.text);
        resolve();
      },
    });
    message.init(document.querySelector(".game-container"));
  }

  randomTextMessage(resolve) {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(
        this.map.gameObjects["hero"].direction
      );
    }

    const options = this.event.options || [];
    const text = options[Math.floor(Math.random() * options.length)];

    let name = null;
    if (this.event.who) {
      const obj = this.map.gameObjects[this.event.who];
      name = obj?.name || this.event.who;
    }
    const message = new TextMessage({
      text,
      name,
      onComplete: () => resolve(),
    });
    message.init(document.querySelector(".game-container"));
  }

  placeTableObjects(resolve) {
    const table = this.map.gameObjects["table"];
    table.interact();
    resolve();
  }

  changeMap(resolve) {
    //Stop all Person things
    Object.values(this.map.gameObjects).forEach((obj) => {
      obj.isMounted = false;
    });

    const sceneTransition = new SceneTransition();
    const mapConfig = window.OverworldMaps[this.event.map];
    if (!mapConfig) {
      console.error(`Map "${this.event.map}" not found in OverworldMaps.`);
      console.log("Available maps:", Object.keys(window.OverworldMaps));
      return;
    }
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap(
        this.event.map,
        window.playerState.character,
        {
          x: this.event.x,
          y: this.event.y,
          direction: this.event.direction,
        }
      );
      resolve();
      sceneTransition.fadeOut();
    });
  }

  battle(resolve) {
    const battle = new Battle({
      enemy: Enemies[this.event.enemyId],
      arena: this.event.arena || null,
      onComplete: (didWin) => {
        resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE");
      },
    });
    battle.init(document.querySelector(".game-container"));
  }

  playMusic(resolve) {
    this.map.handleMusicEvent(this.event);
    resolve();
  }

  pause(resolve) {
    this.map.isPaused = true;
    const menu = new PauseMenu({
      progress: this.map.overworld.progress,
      map: this.map,
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      },
    });
    menu.init(document.querySelector(".game-container"));
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve();
  }

  condition(resolve) {
    const conditions = this.event.conditions || [];
    const allMet = conditions.every((cond) => {
      if (cond.type === "inventory") {
        return cond.items.every((item) => playerState.inventory.includes(item));
      }
      if (cond.type === "tableSet") {
        // Check the table placements
        const table = this.map.gameObjects["table"];
        if (!table) return false;
        const plateCount = table.placements.filter(
          (p) => p.type === "Plate"
        ).length;
        const chopstickCount = table.placements.filter(
          (p) => p.type === "Chopsticks"
        ).length;
        return (
          plateCount >= (cond.plates || 0) &&
          chopstickCount >= (cond.chopsticks || 0)
        );
      }
      if (cond.type === "storyFlag") {
        return !!playerState.storyFlags[cond.flag];
      }
      return false;
    });

    const eventsToRun = allMet ? this.event.onSuccess : this.event.onFail;
    if (eventsToRun && eventsToRun.length) {
      // Run the events as a cutscene
      this.map.startCutscene(eventsToRun).then(resolve);
    } else {
      resolve();
    }
  }

  craftingMenu(resolve) {
    const menu = new CraftingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      },
    });
    menu.init(document.querySelector(".game-container"));
  }

  giveItem(resolve) {
    const item = this.event.item;
    window.playerState.inventory.push(item);

    const message = new TextMessage({
      text: `You received a ${item.replace(/_/g, " ")}!`,
      onComplete: () => {
        resolve();
      },
    });
    message.init(document.querySelector(".game-conatiner"));
  }

  takeItem(resolve) {
    const item = this.event.item;
    const itemName = this.event.itemName;

    if (item.type === "Plates") {
      // Add two "plate entries for each plate picked up"
      window.playerState.inventory.push("plate", "plate");
    } else if (item.type === "Chopsticks") {
      // Add two "plate entries for each plate picked up"
      window.playerState.inventory.push("chopstick", "chopstick");
    } else {
      window.playerState.inventory.push(item.id);
    }
    window.playerState.pickedUpQuestObjects.push(item.id);

    const message = new TextMessage({
      text: `You received ${itemName}`,
      onComplete: () => {
        item.destroy();
        resolve();
      },
    });
    message.init(document.querySelector(".game-container"));
  }

  init() {
    return new Promise((resolve) => {
      this[this.event.type](resolve);
    });
  }
}
