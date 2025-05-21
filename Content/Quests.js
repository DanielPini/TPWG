const QUESTS = {
  fetchNerfs: {
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
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        frame: 3,
      },
    ],
    successConditions: [
      {
        type: "inventory",
        items: ["Nerf1", "Nerf2", "Nerf3", "Nerf4"],
      },
    ],
    onComplete(overworld) {
      new TextMessage({
        text: "Wow! That was a lot. I'd better treat myself to a video game! But Ba-ba wanted to see me first. ** Sigh **",
      });
      playerState.storyFlags["NERFS_COLLECTED"] = true;
      playerState.inventory = playerState.inventory.filter(
        (item) => !["Nerf1", "Nerf2", "Nerf3", "Nerf4"].includes(item)
      );
      // Optionally, show a message or trigger something with the pile
    },
    onFail(overworld) {
      new TextMessage({
        text: "You missed some Nerfs!",
      }).init();
    },
    allowRetry: true,
    despawnOnComplete: true,
    branches: {
      success: "reportToParent",
      fail: "apologiseToParent",
    },
  },
  fetchPlates: {
    spawnObjects: [
      {
        id: "Plate B",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(17),
        y: utils.withGrid(15),
      },
      {
        id: "Plate A",
        type: "Plates",
        map: "Home",
        x: utils.withGrid(11),
        y: utils.withGrid(13),
      },
    ],
    timer: 20000, // 30 seconds
    successConditions: [
      {
        type: "inventory",
        items: ["Plate A", "Plate B"],
      },
    ],
    onComplete(overworld) {
      new TextMessage({
        text: "You did it!!! Now bring the plates to Jiejie. She knows what to do!",
      }).init();
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
        text: "Oh no! You've run out of time! Beg for more?",
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
};
window.Quests = QUESTS;
