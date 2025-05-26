const QUESTS = {
  fetchPlates: {
    music: "./audio/Lao_Gan_Ma_kitchen-audio.mp3",
    spawnObjects: [
      {
        id: "Plate A",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(17),
        y: utils.withGrid(10),
      },
      {
        id: "Plate B",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(17),
        y: utils.withGrid(11),
      },
      {
        id: "Plate C",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(17),
        y: utils.withGrid(12),
      },
      {
        id: "Plate D",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(17),
        y: utils.withGrid(13),
      },
      {
        id: "Chopstick A",
        type: "Chopsticks",
        map: "Home",
        x: utils.withGrid(21),
        y: utils.withGrid(10),
      },
      {
        id: "Chopstick B",
        type: "Chopsticks",
        map: "Home",
        x: utils.withGrid(21),
        y: utils.withGrid(11),
      },
      {
        id: "Chopstick C",
        type: "Chopsticks",
        map: "Home",
        x: utils.withGrid(21),
        y: utils.withGrid(12),
      },
      {
        id: "Chopstick D",
        type: "Chopsticks",
        map: "Home",
        x: utils.withGrid(21),
        y: utils.withGrid(13),
      },
    ],
    timer: 60 * 1000,
    milestones: [
      {
        at: 60 * 1000,
        who: "Jiejie",
        text: "YIIIIIII",
      },
      {
        at: 45 * 1000,
        who: "Jiejie",
        text: "Errr",
      },
      {
        at: 30 * 1000,
        who: "Jiejie",
        text: "Errr and a half",
      },
      {
        at: 15 * 1000,
        who: "Jiejie",
        text: "Errr and three quarters",
      },
      {
        at: 0 * 1000,
        who: "Jiejie",
        text: "San!",
      },
    ],
    successConditions: [
      {
        type: "plateCount",
        count: 8,
      },
    ],
    onComplete(overworld) {
      new TextMessage({
        text: "You did it!!! Now bring the plates to Jiejie. She knows what to do!",
      }).init();
      const quest = QUESTS["fetchPlates"];
      if (quest.previousMusic) {
        overworld.map.handleMusicEvent({
          src: quest.previousMusic,
          loop: true,
        });
      }
      playerState.storyFlags["PLATES_COLLECTED"] = true;
    },
    onFail(overworld) {
      overworld.map.isPaused = false;
      const table = overworld.map.gameObjects["table"];
      if (table && typeof table.breakAllPlacements === "function") {
        table.breakAllPlacements();
      }

      // Remove all plates/chopsticks form inventory and pickedUpQuestObjects
      playerState.inventory = playerState.inventory.filter(
        (item) =>
          !window.PLATE_NAMES.includes(item) &&
          !window.CHOPSTICK_NAMES.includes(item)
      );
      playerState.pickedUpQuestObjects =
        playerState.pickedUpQuestObjects.filter(
          (item) =>
            !window.PLATE_NAMES.includes(item) &&
            !window.CHOPSTICK_NAMES.includes(item)
        );

      Object.keys(overworld.map.gameObjects).forEach((key) => {
        if (
          window.PLATE_NAMES.includes(key) ||
          window.CHOPSTICK_NAMES.includes(key)
        ) {
          delete overworld.map.gameObjects[key];
        }
      });

      const quest = QUESTS["fetchPlates"];

      setTimeout(() => {
        overworld.map.isPaused = true;
        new TextMessage({
          text: "Oh no! You've run out of time to set the table! Jiejie will be mad!!! Beg for more?",
          onComplete: () => {
            console.log(
              "Yes/No box:",
              document.querySelector(".game-container")
            );
            new YesNoPrompt({
              onComplete: (yes) => {
                overworld.map.isPaused = false;
                overworld.startGameLoop();
                if (yes) {
                  if (quest.spawnObjects) {
                    quest.spawnObjects.forEach((obj) => {
                      overworld.addGameObject({ ...obj });
                    });
                  }
                  overworld.questManager.startQuest("fetchPlates");
                } else {
                  delete playerState.storyFlags["PLATES_DELIVERED"];
                  delete playerState.storyFlags["FETCH_PLATES_QUEST"];
                  // Ensure all quest plates are gone
                  Object.keys(overworld.map.gameObjects).forEach((key) => {
                    if (
                      window.PLATE_NAMES.includes(key) ||
                      window.CHOPSTICK_NAMES.includes(key)
                    ) {
                      delete overworld.map.gameObjects[key];
                    }
                  });
                  overworld.map.isPaused = false;
                  new TextMessage({
                    text: "** Flip the table and deal with the consequences! **",
                  }).init();
                }
              },
            }).init();
          },
        }).init();
      }, 2000);

      if (quest.previousMusic) {
        overworld.map.handleMusicEvent({
          src: quest.previousMusic,
          loop: true,
        });
      }
    },
    allowRetry: true,
    retryDelay: 2000,
    despawnOnComplete: true,
    // branches: {
    //   success: "helpBaba",
    //   fail: "apologiseToMom",
    // },
  },
  // helpBaba: {
  //   successConditions: [
  //     {
  //       type: "flag",
  //       flag: "PLAYER_TALKED_TO_BABA",
  //     },
  //   ],
  //   onComplete(overworld) {
  //     console.log("You helped Baba.");
  //   },
  // },
  fetchNerfs: {
    music: "./audio/Timestables_kid-audio.mp3",
    spawnObjects: [
      {
        // In the top left corner of the room
        id: "Nerf1",
        type: "NerfPile",
        map: "Home",
        x: utils.withGrid(0),
        y: utils.withGrid(6),
      },
      {
        // Below the piano stool
        id: "Nerf2",
        type: "Nerf",
        map: "Home",
        x: utils.withGrid(2),
        y: utils.withGrid(8),
        frame: 1,
      },
      {
        // On the sofa
        id: "Nerf3",
        type: "Nerf",
        map: "Home",
        x: utils.withGrid(5),
        y: utils.withGrid(6),
        frame: 2,
      },
      {
        // On the top left chiar of the dining room table
        id: "Nerf4",
        type: "Nerf",
        map: "Home",
        x: utils.withGrid(7),
        y: utils.withGrid(11),
        frame: 3,
      },
      {
        // To the left of the desk chair
        id: "Nerf5",
        type: "Nerf",
        map: "Home",
        x: utils.withGrid(1),
        y: utils.withGrid(16),
        frame: 2,
      },
      {
        // On the balcony next to the balistrade
        id: "Nerf6",
        type: "Nerf",
        map: "Home",
        x: utils.withGrid(9),
        y: utils.withGrid(6),
        frame: 1,
      },
      {
        // In front of the fridge
        id: "Nerf7",
        type: "Nerf",
        map: "Home",
        x: utils.withGrid(18),
        y: utils.withGrid(10),
        frame: 2,
      },
      {
        id: "Nerf8",
        type: "Nerf",
        map: "Home",
        x: utils.withGrid(9),
        y: utils.withGrid(25),
        frame: 3,
      },
      {
        id: "Nerf9",
        type: "NerfPile",
        map: "Home",
        x: utils.withGrid(4),
        y: utils.withGrid(18),
        frame: 0,
      },
      {
        id: "Nerf10",
        type: "NerfPile",
        map: "Home",
        x: utils.withGrid(21),
        y: utils.withGrid(16),
        frame: 1,
      },
      {
        id: "Nerf11",
        type: "Nerf",
        map: "Home",
        x: utils.withGrid(19),
        y: utils.withGrid(24),
        frame: 3,
      },
      {
        id: "Nerf12",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(2),
        y: utils.withGrid(5),
        frame: 3,
      },
      {
        id: "Nerf13",
        type: "NerfPile",
        map: "Kid",
        x: utils.withGrid(8),
        y: utils.withGrid(15),
        frame: 0,
      },
      {
        id: "Nerf14",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(5),
        y: utils.withGrid(6),
        frame: 3,
      },
      {
        id: "Nerf15",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(1),
        y: utils.withGrid(15),
        frame: 2,
      },
      {
        id: "Nerf16",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(3),
        y: utils.withGrid(11),
        frame: 3,
      },
      {
        id: "Nerf17",
        type: "Nerf",
        map: "Bathroom",
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        frame: 2,
      },
      {
        id: "Nerf18",
        type: "NerfPile",
        map: "Bathroom",
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        frame: 3,
      },
      {
        id: "Nerf19",
        type: "Nerf",
        map: "Bathroom",
        x: utils.withGrid(3),
        y: utils.withGrid(9),
        frame: 0,
      },
      {
        id: "Nerf20",
        type: "Nerf",
        map: "Master",
        x: utils.withGrid(0),
        y: utils.withGrid(5),
        frame: 1,
      },
      {
        id: "Nerf21",
        type: "Nerf",
        map: "Master",
        x: utils.withGrid(1),
        y: utils.withGrid(11),
        frame: 3,
      },
      {
        id: "Nerf22",
        type: "Nerf",
        map: "Master",
        x: utils.withGrid(5),
        y: utils.withGrid(8),
        frame: 2,
      },
      {
        id: "Nerf23",
        type: "Nerf",
        map: "Master",
        x: utils.withGrid(5),
        y: utils.withGrid(4),
        frame: 3,
      },
      {
        id: "Nerf24",
        type: "NerfPile",
        map: "Master",
        x: utils.withGrid(8),
        y: utils.withGrid(9),
        frame: 3,
      },
      {
        id: "Nerf25",
        type: "NerfPile",
        map: "Laundry",
        x: utils.withGrid(0),
        y: utils.withGrid(5),
        frame: 3,
      },
    ],
    successConditions: [
      {
        type: "inventory",
        items: [
          "Nerf1",
          "Nerf2",
          "Nerf3",
          "Nerf4",
          "Nerf5",
          "Nerf6",
          "Nerf7",
          "Nerf8",
          "Nerf9",
          "Nerf10",
          "Nerf11",
          "Nerf12",
          "Nerf13",
          "Nerf14",
          "Nerf15",
          "Nerf16",
          "Nerf17",
          "Nerf18",
          "Nerf19",
          "Nerf20",
          "Nerf21",
          "Nerf22",
          "Nerf23",
          "Nerf24",
          "Nerf25",
        ],
      },
    ],
    onComplete(overworld) {
      new TextMessage({
        who: "Didi",
        text: "Wow! That was a lot. I'd better treat myself to a video game! But Ba-ba wanted to see me first. ** Sigh **",
      }).init();
      playerState.storyFlags["NERFS_COLLECTED"] = true;
      playerState.inventory = playerState.inventory.filter(
        (item) =>
          ![
            "Nerf1",
            "Nerf2",
            "Nerf3",
            "Nerf4",
            "Nerf5",
            "Nerf6",
            "Nerf7",
            "Nerf8",
            "Nerf9",
            "Nerf10",
            "Nerf11",
            "Nerf12",
            "Nerf13",
            "Nerf14",
            "Nerf15",
            "Nerf16",
            "Nerf17",
            "Nerf18",
            "Nerf19",
            "Nerf20",
            "Nerf21",
            "Nerf22",
            "Nerf23",
            "Nerf24",
            "Nerf25",
          ].includes(item)
      );
      // Optionally, show a message or trigger something with the pile
      const quest = QUESTS["fetchNerfs"];
      if (quest.previousMusic) {
        overworld.map.handleMusicEvent({
          src: quest.previousMusic,
          loop: true,
        });
      }
    },
    onFail(overworld) {
      new TextMessage({
        text: "You missed some Nerfs!",
      }).init();
      const quest = QUESTS["fetchNerfs"];
      if (quest.previousMusic) {
        overworld.map.handleMusicEvent({
          src: quest.previousMusic,
          loop: true,
        });
      }
    },
    allowRetry: true,
    despawnOnComplete: true,
    // branches: {
    //   success: "reportToParent",
    //   fail: "apologiseToParent",
    // },
  },
};

window.Quests = QUESTS;
