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
      Nerf: "./images/Nerf.png",
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

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];

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
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    };
    document.addEventListener("PersonWalkingComplete", completeHandler);
  }

  textMessage(resolve) {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(
        this.map.gameObjects["hero"].direction
      );
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve(),
    });
    message.init(document.querySelector(".game-container"));
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

    window.playerState.inventory.push(item.id);
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
