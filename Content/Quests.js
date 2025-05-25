const QUESTS = {
  fetchPlates: {
    music: "./audio/Lao_Gan_Ma_kitchen-audio.mp3",
    spawnObjects: [
      {
        id: "Plate B",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(17),
        y: utils.withGrid(13),
      },
      {
        id: "Plate A",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(11),
        y: utils.withGrid(12),
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
        type: "storyFlag",
        flag: "PLATES_DELIVERED",
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
      console.log("Plates delivered! Quest success.");
      playerState.storyFlags["PLATES_COLLECTED"] = true;
      playerState.inventory = playerState.inventory.filter(
        (item) => item !== "Plate A" && item !== "Plate B"
      );
    },
    onFail(overworld) {
      console.log("Called onFail");
      overworld.map.isPaused = true;
      new TextMessage({
        text: "Oh no! You've run out of time to set the table! Jiejie will be mad!!! Beg for more?",
        onComplete: () => {
          console.log("Yes/No box:", document.querySelector(".game-container"));
          new YesNoPrompt({
            onComplete: (yes) => {
              overworld.map.isPaused = false;
              overworld.startGameLoop();
              if (yes) {
                overworld.questManager.startQuest("fetchPlates");
              } else {
                overworld.map.isPaused = false;
                new TextMessage({
                  text: "** Flip the table and deal with the consequences! **",
                }).init();
              }
            },
          }).init();
        },
      }).init();
      const quest = QUESTS["fetchPlates"];
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
    branches: {
      success: "helpBaba",
      fail: "apologiseToMom",
    },
  },
  helpBaba: {
    successConditions: [
      {
        type: "flag",
        flag: "PLAYER_TALKED_TO_BABA",
      },
    ],
    onComplete(overworld) {
      console.log("You helped Baba.");
    },
  },
  fetchNerfs: {
    music: "./audio/Timestables_kid-audio.mp3",
    spawnObjects: [
      {
        id: "Nerf1",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(4),
        y: utils.withGrid(11),
        frame: 0,
      },
      {
        id: "Nerf2",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(7),
        y: utils.withGrid(5),
        frame: 1,
      },
      {
        id: "Nerf3",
        type: "Nerf",
        map: "Bathroom",
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        frame: 2,
      },
      {
        id: "Nerf4",
        type: "Nerf",
        map: "Laundry",
        x: utils.withGrid(4),
        y: utils.withGrid(5),
        frame: 3,
      },
      {
        id: "Nerf5",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(4),
        y: utils.withGrid(11),
        frame: 0,
      },
      {
        id: "Nerf6",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(7),
        y: utils.withGrid(5),
        frame: 1,
      },
      {
        id: "Nerf7",
        type: "Nerf",
        map: "Bathroom",
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        frame: 2,
      },
      {
        id: "Nerf8",
        type: "Nerf",
        map: "Laundry",
        x: utils.withGrid(4),
        y: utils.withGrid(5),
        frame: 3,
      },
      {
        id: "Nerf9",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(4),
        y: utils.withGrid(11),
        frame: 0,
      },
      {
        id: "Nerf10",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(7),
        y: utils.withGrid(5),
        frame: 1,
      },
      {
        id: "Nerf11",
        type: "Nerf",
        map: "Bathroom",
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        frame: 2,
      },
      {
        id: "Nerf12",
        type: "Nerf",
        map: "Laundry",
        x: utils.withGrid(4),
        y: utils.withGrid(5),
        frame: 3,
      },
      {
        id: "Nerf13",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(4),
        y: utils.withGrid(11),
        frame: 0,
      },
      {
        id: "Nerf14",
        type: "Nerf",
        map: "Kid",
        x: utils.withGrid(7),
        y: utils.withGrid(5),
        frame: 1,
      },
      {
        id: "Nerf15",
        type: "Nerf",
        map: "Bathroom",
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        frame: 2,
      },
      {
        id: "Nerf16",
        type: "Nerf",
        map: "Laundry",
        x: utils.withGrid(4),
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
          "Nerf4",
          "Nerf15",
          "Nerf16",
        ],
      },
    ],
    onComplete(overworld) {
      new TextMessage({
        who: "Didi",
        text: "Wow! That was a lot. I'd better treat myself to a video game! But Ba-ba wanted to see me first. ** Sigh **",
      });
      playerState.storyFlags["NERFS_COLLECTED"] = true;
      playerState.inventory = playerState.inventory.filter(
        (item) => !["Nerf1", "Nerf2", "Nerf3", "Nerf4"].includes(item)
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
    branches: {
      success: "reportToParent",
      fail: "apologiseToParent",
    },
  },
};

window.Quests = QUESTS;
