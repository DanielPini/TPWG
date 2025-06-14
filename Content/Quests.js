const QUESTS = {
  fetchPlates: {
    music: "./audio/Lao_Gan_Ma_kitchen-audio.mp3",
    spawnObjects: [
      {
        id: "Plate A",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(17),
        y: utils.withGrid(11),
      },
      {
        id: "Plate B",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(17),
        y: utils.withGrid(12),
      },
      {
        id: "Plate C",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(17),
        y: utils.withGrid(13),
      },
      {
        id: "Plate D",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(17),
        y: utils.withGrid(14),
      },
      {
        id: "Chopstick A",
        type: "Chopsticks",
        map: "Home",
        x: utils.withGrid(21),
        y: utils.withGrid(11),
      },
      {
        id: "Chopstick B",
        type: "Chopsticks",
        map: "Home",
        x: utils.withGrid(21),
        y: utils.withGrid(12),
      },
      {
        id: "Chopstick C",
        type: "Chopsticks",
        map: "Home",
        x: utils.withGrid(21),
        y: utils.withGrid(13),
      },
      {
        id: "Chopstick D",
        type: "Chopsticks",
        map: "Home",
        x: utils.withGrid(21),
        y: utils.withGrid(14),
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
        at: 1,
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
      } else {
        overworld.map.handleMusicEvent({
          src: "./audio/We_Song_entryway-audio.mp3",
          loop: true,
        });
      }
      playerState.storyFlags["PLATES_COLLECTED"] = true;

      // Persist table placements
      const table = overworld.map.gameObjects["table"];
      if (table) {
        // Save a deep copy of placements to playerState
        playerState.tablePlacements = JSON.parse(
          JSON.stringify(table.placements)
        );
      }
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
      utils.emitEvent("PlayerStateUpdated");
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
        y: utils.withGrid(7),
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
        x: utils.withGrid(4),
        y: utils.withGrid(4),
        frame: 2,
      },
      {
        id: "Nerf18",
        type: "NerfPile",
        map: "Bathroom",
        x: utils.withGrid(5),
        y: utils.withGrid(8),
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
        y: utils.withGrid(6),
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
        y: utils.withGrid(7),
        frame: 3,
      },
    ],
    successConditions: [
      {
        type: "nerfsCollected",
        count: 25,
      },
    ],
    onComplete(overworld) {
      new TextMessage({
        text: "* Quest complete: Pick up the nerfs left lying around the house *",
      }).init();
      new TextMessage({
        who: "Didi",
        text: "Wow! That was a lot. I'd better treat myself to a video game! But Ba-ba wanted to see me first. ** Sigh **",
      }).init();
      playerState.storyFlags["NERFS_COLLECTED"] = true;
      playerState.inventory = playerState.inventory.filter(
        (item) => item !== "nerf"
      );
      utils.emitEvent("PlayerStateUpdated");
      // Optionally, show a message or trigger something with the pile
      const quest = QUESTS["fetchNerfs"];
      if (quest.previousMusic) {
        overworld.map.handleMusicEvent({
          src: quest.previousMusic,
          loop: true,
        });
      }
    },
    onFail(overworld) {},
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
        text: "Mum is so beautiful, if she thinks she’s fat, what does that mean for me? Do I even have a chance?",
      },
      {
        name: "Jiejie",
        text: "Hmm, let's make this a delicious Fruito for Didi. Maybe mum will see how hard I'm working, too.",
      },
      {
        name: "Jiejie",
        text: "Have I been too harsh with him? But mum wanted everything to be done quickly...",
      },
      {
        name: "Jiejie",
        text: "No... Mum was really stressed... We need to lay down some rules in this house. But the look on his face...",
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
        timer: 90,
        steps: [
          {
            // Point towards Master room
            arrowTarget: {
              x: utils.withGrid(20),
              y: utils.withGrid(25),
              map: "HomeMediation",
            },
            location: { x: utils.withGrid(20), y: utils.withGrid(25) },
            music: "./audio/Sounds_of_my_house_at_seven_living-audio.mp3", // <-- Use correct path
            cutscene: [
              {
                type: "playMusic",
                src: "./audio/Sounds_of_my_house_at_seven_living-audio.mp3",
                loop: true,
              },
              {
                type: "sit",
                direction: "up",
                who: "hero",
              },
              {
                type: "textMessage",
                text: "It's good to take a moment for practise. Piano calms me down.",
                who: "Jiejie",
              },
              { type: "textMessage", text: "* Angry shouting... *" },
              {
                type: "textMessage",
                text: "Why are you getting so worked up. It's only guests.",
                who: "Baba",
              },
              {
                type: "walk",
                direction: "down",
                who: "hero",
              },
              {
                type: "walk",
                direction: "down",
                who: "hero",
              },
              {
                type: "textMessage",
                text: "* sigh *",
                who: "Jiejie",
              },
              {
                type: "textMessage",
                text: "Mum and Baba have lost it over the stress of the guests.",
                who: "Jiejie",
              },
              {
                type: "textMessage",
                text: "I'll go help them.",
                who: "Jiejie",
              },
              {
                type: "textMessage",
                text: "How can you just stand here and complain when I'm spending all day putting the house in order.",
                who: "Mum",
              },
              {
                type: "textMessage",
                text: "Do you want to embarrass us?!",
                who: "Mum",
              },
              {
                type: "textMessage",
                text: "You say I'm standing here the whole day? Have you not seen anything I've done?!",
                who: "Baba",
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
            // Point towards square in front of the parents
            location: { x: utils.withGrid(4), y: utils.withGrid(6) },
            arrowTarget: {
              x: utils.withGrid(4),
              y: utils.withGrid(6),
              map: "MasterMediation",
            },
            cutscene: [
              {
                type: "stand",
                direction: "right",
                who: "Baba",
              },
              {
                type: "stand",
                direction: "left",
                who: "Mum",
              },
              {
                type: "textMessage",
                text: "What I see is you watching me work while you and the kids relax!",
                who: "Mum",
              },
              {
                type: "stand",
                direction: "down",
                time: 200,
                who: "Mum",
              },
              {
                type: "walk",
                direction: "down",
                who: "hero",
              },
              {
                type: "walk",
                direction: "down",
                who: "hero",
              },
              {
                type: "stand",
                direction: "left",
                who: "hero",
              },
              {
                type: "stand",
                direction: "right",
                who: "Mum",
              },
              {
                type: "textMessage",
                text: "Jiejie, set your dad straight.",
                who: "Mum",
              },
              {
                type: "stand",
                direction: "left",
                who: "hero",
              },
              {
                type: "textMessage",
                text: "Yeah, you have seen how I've been supporting your mother and helping Didi with his tasks.",
                who: "Baba",
              },
              {
                type: "textMessage",
                text: "You need to support me.",
                who: "Baba",
              },
              {
                type: "textMessage",
                text: "...",
                who: "Jiejie",
              },
              {
                type: "stand",
                direction: "left",
                who: "Mum",
              },
              {
                type: "stand",
                direction: "right",
                who: "Baba",
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
                    text: "You really think I don't see all you do?",
                    name: "Baba",
                  },
                  {
                    text: "Of course I see it. You do so much for this family.",
                    name: "Baba",
                  },
                  {
                    text: "I know how hard you work. We all do and we're grateful.",
                    name: "Baba",
                  },
                  {
                    text: "I'd just like you to know you don't have to do it all alone..",
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
                  {
                    type: "textMessage",
                    text: "* Chuckle *",
                    who: "Both",
                  },
                  {
                    type: "textMessage",
                    text: "Thanks for that Jiejie",
                    who: "Mum",
                  },
                  {
                    type: "textMessage",
                    text: "I think we let the stress get to us (ᵕ—ᴗ—)",
                    who: "Baba",
                  },
                ],
              },
              {
                text: "You're both right. It's a disaster. Panic!!!!!",
                responses: [
                  { text: "Aaaaaah!", name: "Mum" },
                  { text: "Aaaaaah!", name: "Baba" },
                  { text: "Aaaaaah!", name: "Jiejie" },
                  { text: "Aaaaaah!", name: "Mum" },
                  { text: "Aaaaaah!", name: "Baba" },
                  { text: "Hmm!", name: "Mum" },
                  { text: "Maybe we can get back to work now?", name: "Mum" },
                  { text: "...", name: "Jiejie" },
                  { text: "...", name: "Baba" },
                ],
              },
            ],
            afterChoiceCutscene: [
              {
                type: "stand",
                direction: "down",
                who: "hero",
              },
              {
                type: "textMessage",
                text: "Guess it's up to me to be the adult in this family... Yikes.",
                who: "Jiejie",
              },
            ],
          },
        ],
      },
      {
        timer: 70,
        steps: [
          {
            // Point to Master doorway
            arrowTarget: {
              x: utils.withGrid(7),
              y: utils.withGrid(3),
              map: "MasterMediation",
            },
            location: { x: utils.withGrid(7), y: utils.withGrid(3) },
            music: "./audio/Barangaroo_Baby_dining-audio.mp3", // <-- Use correct path
            cutscene: [
              {
                type: "playMusic",
                src: "./audio/Barangaroo_Baby_dining-audio.mp3",
                loop: true,
              },
              {
                type: "textMessage",
                text: "Whew, that's one thing sorted!",
                who: "Jiejie",
              },
              {
                type: "stand",
                direction: "right",
              },
              {
                type: "textMessage",
                text: "* The acrid smoke billows from the kitchen *",
              },
              {
                type: "stand",
                direction: "down",
              },
              {
                type: "textMessage",
                text: "What now?! (III╥_╥⁠)",
                who: "Jiejie",
              },
              {
                type: "walk",
                direction: "right",
                who: "Jiejie",
              },
              {
                type: "walk",
                direction: "right",
                who: "Jiejie",
              },
              {
                type: "walk",
                direction: "right",
                who: "Jiejie",
              },
              {
                type: "stand",
                direction: "up",
                who: "Jiejie",
              },
              {
                type: "stand",
                direction: "left",
                who: "Jiejie",
              },
              {
                type: "textMessage",
                text: "Mum and Baba are occupied...",
                who: "Jiejie",
              },
              {
                type: "stand",
                direction: "down",
                who: "Jiejie",
              },
              {
                type: "textMessage",
                text: "I guess it's up to me to get to the kitchen to check on the food.",
                who: "Jiejie",
              },
            ],
          },
          {
            location: { x: utils.withGrid(19), y: utils.withGrid(10) },
            arrowTarget: {
              x: utils.withGrid(19),
              y: utils.withGrid(10),
              map: "HomeMediation",
            },
            despawnNPCs: ["Didi"],
            dialogue: [
              {
                text: "Oh no! The food will be ruined!!!",
                who: "Jiejie",
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
                    text: "Hissssssssssss",
                    name: "Oven",
                  },
                  {
                    text: "* Smoke dissipates *",
                  },
                  {
                    text: "...",
                    name: "Jiejie",
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
                    text: "Don't waste food!",
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
                  {
                    text: "I'll just ... scrape off the charcoal.",
                    name: "Jiejie",
                  },
                  {
                    text: "And go check on Didi. He needs you to be a good influence, especially when we have guests coming over.",
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
      {
        // Leg 3: Go to KidMediation, comfort Didi
        timer: 60,
        steps: [
          {
            arrowTarget: {
              x: utils.withGrid(22),
              y: utils.withGrid(17),
              map: "HomeMediation", // Fix: arrow to MasterMediation doorway
            },
            location: { x: utils.withGrid(22), y: utils.withGrid(17) },
            music: "./audio/Timestables_kid-audio.mp3",
            dialogue: [
              { text: "I should check on him in his room.", name: "Jiejie" },
            ],
          },
          {
            arrowTarget: {
              x: utils.withGrid(3),
              y: utils.withGrid(6),
              map: "KidMediation",
            },
            location: { x: utils.withGrid(3), y: utils.withGrid(6) },
            spawnNPCs: [
              {
                id: "Didi",
                type: "Person",
                x: utils.withGrid(3),
                y: utils.withGrid(5),
                direction: "down",
                src: "./images/characters/people/Brother.png",
                talking: [],
              },
            ],
            cutscene: [
              {
                type: "textMessage",
                text: "Why does no one listen to me? It's not fair!",
                who: "Didi",
              },
              {
                type: "stand",
                direction: "left",
                who: "Didi",
              },
              {
                type: "textMessage",
                text: "Didi, is that you?",
                who: "Jiejie",
              },
              {
                type: "walk",
                direction: "right",
                who: "hero",
              },
              {
                type: "stand",
                direction: "down",
                who: "Didi",
              },
              {
                type: "stand",
                direction: "up",
                who: "hero",
              },
              {
                type: "textMessage",
                text: "I didn't realise you that way.",
                who: "Jiejie",
              },
            ],
            choices: [
              {
                text: "Reassure Didi",
                responses: [
                  {
                    text: "It's okay, Didi. I'm here for you. I know it can be tough, but we have to stick up for each other.",
                    name: "Jiejie",
                  },
                  {
                    text: "You're the only brother I have.",
                    name: "Jiejie",
                  },
                  { text: "Thanks, Jiejie...", name: "Didi" },
                  { text: "Sometimes I can't wait to grow up.", name: "Didi" },
                  {
                    text: "But lately, it seems like it's just more and more work...",
                    name: "Didi",
                  },
                  { text: "I'm glad I can come to you, though.", name: "Didi" },
                  { text: "Thanks (◡ ‿ ◡ .)", name: "Didi" },
                ],
              },
              {
                text: "Tell Didi to tough it out.",
                responses: [
                  { text: "You need to be strong, Didi.", name: "Jiejie" },
                  {
                    text: "Mum and Baba need us, especially with the guests coming over.",
                    name: "Jiejie",
                  },
                  { text: "I guess...", name: "Didi" },
                  {
                    text: "I was hoping for a bit of space, but I can try harder Jiejie.",
                    name: "Didi",
                  },
                  { text: "For Mum and Baba. And for you.", name: "Didi" },
                ],
              },
            ],
            afterChoiceCutscene: [
              {
                type: "textMessage",
                text: "Kids, hurry up to the table. Our guests are here.",
                who: "Mum",
              },
              {
                type: "textMessage",
                text: "I'd better go. I'll see you there soon, Jiejie!",
                who: "Didi",
              },
              {
                type: "walk",
                direction: "right",
                who: "hero",
              },
              {
                type: "stand",
                direction: "left",
                who: "hero",
              },
              {
                type: "walk",
                direction: "down",
                who: "Didi",
              },
              {
                type: "walk",
                direction: "down",
                who: "Didi",
              },
              {
                type: "walk",
                direction: "down",
                who: "Didi",
              },
              {
                type: "walk",
                direction: "down",
                who: "Didi",
              },
              {
                type: "walk",
                direction: "down",
                who: "Didi",
              },
              {
                type: "walk",
                direction: "down",
                who: "Didi",
              },
              {
                type: "walk",
                direction: "down",
                who: "Didi",
              },
              {
                type: "walk",
                direction: "down",
                who: "Didi",
              },
            ],
            despawnNPCs: ["Didi"],
          },
        ],
      },
      {
        // Leg 4: Dinner in HomeMediation
        timer: 50,
        steps: [
          {
            arrowTarget: {
              x: utils.withGrid(0),
              y: utils.withGrid(13),
              map: "KidMediation",
            },
            location: { x: utils.withGrid(0), y: utils.withGrid(13) },
            music: "./audio/JieJie_balcony-audio.mp3",
          },
          {
            despawnNPCs: ["Didi"],
            spawnNPCs: [
              {
                id: "Didi",
                x: utils.withGrid(7),
                y: utils.withGrid(15),
                isSitting: true,
                direction: "up",
              },
            ],
            arrowTarget: {
              x: utils.withGrid(9),
              y: utils.withGrid(11),
              map: "HomeMediation",
            },
            location: { x: utils.withGrid(9), y: utils.withGrid(11) },
            spawnNPCs: [
              {
                id: "Mum",
                type: "Person",
                x: utils.withGrid(6), // 6, 13, but meeting before the table
                y: utils.withGrid(13),
                src: "./images/characters/people/Mum.png",
                direction: "right",
                talking: [],
              },
              {
                id: "Baba",
                type: "Person",
                x: utils.withGrid(12), // 12, 13, but meeting before the table
                y: utils.withGrid(13),
                src: "./images/characters/people/Ba-ba.png",
                direction: "left",
                talking: [],
              },
              {
                id: "Didi",
                type: "Person",
                x: utils.withGrid(7), // 7, 15, already in his seat
                y: utils.withGrid(15),
                src: "./images/characters/people/Brother.png",
                talking: [],
              },
              {
                id: "NPC1",
                type: "Person",
                x: utils.withGrid(7), // 7, 11, but meeting before the table
                y: utils.withGrid(11),
                src: "./images/characters/people/Guest1.png",
                talking: [],
              },
              {
                id: "NPC2",
                type: "Person",
                x: utils.withGrid(11), // 11, 11 but meeting before the table.
                y: utils.withGrid(11),
                src: "./images/characters/people/Guest2.png",
                talking: [],
              },
            ],
            cutscene: [
              {
                type: "playMusic",
                src: "./audio/JieJie_balcony-audio.mp3",
                loop: true,
              },
              { type: "sit", direction: "down", who: "NPC1" },
              { type: "sit", direction: "down", who: "NPC2" },
              { type: "sit", direction: "left", who: "Baba" },
              { type: "sit", direction: "right", who: "Mum" },
              { type: "sit", direction: "up", who: "Didi" },
              { type: "textMessage", text: "Kids! Right on time", who: "Mum" },
              {
                type: "textMessage",
                text: "Meet our special guests!",
                who: "Mum",
              },
            ],
            dialogue: [
              {
                text: "Dinner is ready, So let's all sit together and eat!",
                name: "Mum",
              },
              { text: "Thank you for joining us.", name: "Baba" },
              {
                text: "It has been a big day, but hopefully you learned a bit about each other's perspectives.",
                name: "Baba",
              },
              { text: "And ideally had some fun along the way.", name: "Mum" },
              {
                text: "This game is just a taste of what is in store with Christine Pan's The Parts We Give, the song cycle.",
                name: "Mystery Guest 1",
              },
              {
                text: "At the end of the game is a special reward which will give you an exclusive discount to go see the song cycle.",
                name: "Mystery Guest 2",
              },
              {
                text: "If you liked the game, please share it with your friends and family, and let us know what you thought.",
                name: "Mystery Guest 2",
              },
              {
                text: "This has truly been a labour of love, so we're thrilled to be able to share it with you!",
                name: "Mystery Guest 1",
              },
            ],
          },
        ],
      },
    ],
    onStart(overworld) {
      overworld.startMediationQuest(this);
    },
    onComplete(overworld) {
      console.log("Quest Complete. EndGameMessage shown");
      overworld.map.handleMusicEvent({
        src: "./audio/JieJie_balcony-audio.mp3",
        loop: true,
      });
      new EndGameMessage({
        overworld,
        onComplete: () => {
          // Optionally do any cleanup here
        },
      }).init();
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
