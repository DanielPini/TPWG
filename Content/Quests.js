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
  chopFruit: {
    id: "chopFruit",
    name: "Chop the Apple",
    background: "./images/maps/TableclothChoppingRoom.png",
    knifeSrc: "./images/objects/Knife.png",
    appleSrc: "./images/objects/Apple.png",
    applePhases: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ],
    dialogue: [
      {
        name: "Jiejie",
        text: "Why does Didi get all the delicious food and mum and I have to watch our weight?",
      },
      {
        name: "Jiejie",
        text: "* Mum is so beautiful, if she thinks she’s fat, what does that mean for me? *",
      },
      {
        name: "Jiejie",
        text: "* Hmm, let's make this a delicious Fruito for Didi. *",
      },
      {
        name: "Jiejie",
        text: "* Have I been too harsh with him? But mum wanted everything to be done quickly... *",
      },
      {
        name: "Jiejie",
        text: "* No... Mum was really stressed... We need to lay down some rules in this house. But the look on his face... *",
      },
    ],
    onStart(overworld) {
      overworld.startChopFruitQuest(this);
    },
    onComplete(overworld) {
      // Return to previous map or trigger next quest
    },
  },
  mediationQuest: {
    id: "mediationQuest",
    name: "Mediation Quest",
    map: "HomeMediation",
    legs: [
      {
        timer: 30,
        steps: [
          {
            arrowTarget: {
              x: utils.withGrid(20),
              y: utils.withGrid(25),
              map: "HomeMediation",
            },
            location: { x: utils.withGrid(20), y: utils.withGrid(25) },
            music: "./audio/Sounds_of_my_house_at_seven_living-audio.mp3", // <-- Use correct path
            dialogue: [
              {
                text: "It's good to take a moment for practise. Piano calms me down.",
                name: "Jiejie",
              },
              { text: "* Angry shouting... *" },
              {
                text: "Why are you getting so worked up. It's only guests.",
                name: "Baba",
              },
              {
                text: "How can you just stand here and complain when I'm spending all day putting the house in order.",
                name: "Mum",
              },
              { text: "Do you want to embarrass us?!", name: "Mum" },
              {
                text: "You say I'm standing here the whole day? Have you not seen anything I've done?!",
                name: "Baba",
              },
            ],
          },
          {
            spawnNPCs: [
              {
                id: "Mum",
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(5),
                src: "./images/characters/people/Mum.png",
                talking: [],
              },
              {
                id: "Baba",
                type: "Person",
                x: utils.withGrid(3),
                y: utils.withGrid(5),
                src: "./images/characters/people/Ba-ba.png",
                talking: [],
              },
            ],
            location: { x: utils.withGrid(4), y: utils.withGrid(5) },
            arrowTarget: {
              x: utils.withGrid(4),
              y: utils.withGrid(5),
              map: "Master",
            },
            music: "./audio/Sounds_of_my_house_at_seven_living-audio.mp3", // <-- Use correct path
            dialogue: [
              {
                text: "What I see is you watching me work while you and the kids relax!",
                name: "Mum",
              },
            ],
            choices: [
              {
                text: "Mum is right, she works so hard. You should apologise Baba!",
                responses: [
                  {
                    text: "Thank you for seeing my hard work. I thought it went unnoticed.",
                    name: "Mum",
                  },
                  {
                    text: "I know how hard you work. We all see it. Thank you for what you do.",
                    name: "Baba",
                  },
                ],
              },
              {
                // despawnNPCs: [ "Mum" ],
                text: "Give him some slack. He has been working hard too, even if you can't see it.",
                responses: [
                  {
                    text: "I suppose you're right. I'm just so worked up about our guests and I don't want to embarrass ourselves in front of them.",
                    name: "Mum",
                  },
                  {
                    text: "Let's work together and it will get done in no time.",
                    name: "Baba",
                  },
                ],
              },
              {
                text: "You're both right. It's a disaster. Panic!!!!!",
                responses: [
                  { text: "Aaaaaah!", name: "Mum" },
                  { text: "Aaaaaah!", name: "Baba" },
                ],
              },
            ],
            npcPositions: {
              Mum: {
                x: utils.withGrid(5),
                y: utils.withGrid(5),
              },
              Baba: {
                x: utils.withGrid(3),
                y: utils.withGrid(5),
              },
            },
          },
        ],
      },
      {
        timer: 30,
        steps: [
          {
            location: { x: utils.withGrid(19), y: utils.withGrid(10) },
            arrowTarget: {
              x: utils.withGrid(19),
              y: utils.withGrid(10),
              map: "Master",
            },
            music: "./audio/Sounds_of_my_house_at_seven_living-audio.mp3", // <-- Use correct path
            dialogue: [
              {
                text: "Whew, that's one thing sorted!",
                name: "Jiejie",
              },
              { text: "* The smell of acrid smoke billows from the kitchen *" },
              {
                text: "Oh no! The food will be ruined!!!",
                name: "Jiejie",
              },
            ],
            choices: [
              {
                text: "Kick the oven",
                responses: [
                  {
                    text: "Burrrrrrrrr",
                    name: "Oven",
                  },
                  {
                    text: "Clunck",
                    name: "Oven",
                  },
                  {
                    text: "* Smoke dissipates *",
                  },
                  {
                    text: "Well, I'm not going to question that...",
                    name: "Jiejie",
                  },
                ],
              },
              {
                text: "... So ... I wanted takeout anyway...",
                responses: [
                  {
                    text: "I heard that!",
                    name: "Mum",
                  },
                  {
                    text: "No takeout. Home cooking is better. Make it work.",
                    name: "Mum",
                  },
                  {
                    text: "* Sigh *",
                    name: "Jiejie",
                  },
                ],
              },
            ],
          },
        ],
      },
      // ...more steps
    ],
    onStart(overworld) {
      overworld.startMediationQuest(this);
    },
    onComplete(overworld) {
      // wrap up quest
    },
    onFail(overworld) {
      if (overworld.questManager && overworld.questManager.currentRunner) {
        overworld.questManager.currentRunner.targetHighlightActive = false;
        if (overworld.questManager.currentRunner.questArrow) {
          overworld.questManager.currentRunner.questArrow.hide();
        }
      }
    },
  },
};

window.Quests = QUESTS;
