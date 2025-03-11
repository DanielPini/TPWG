class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.configObjects = config.configObjects; // Configuration content
    this.gameObjects = {}; // Starts empty, live object instances in the map get added here
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }
    // Check for objects that match
    return Object.values(this.gameObjects).find((obj) => {
      if (obj.x === x && obj.y === y) {
        return true;
      }
      if (
        obj.intentPosition &&
        obj.intentPosition[0] === x &&
        obj.intentPosition[1] === y
      ) {
        return true;
      }
      return false;
    });
  }

  mountObjects() {
    Object.keys(this.configObjects).forEach((key) => {
      let config = this.configObjects[key];
      config.id = key;

      let obj;
      if (config.type === "Person") {
        obj = new Person(config);
      }
      if (config.type === "PizzaStone") {
        obj = new PizzaStone(config);
      }
      this.gameObjects[key] = obj;
      this.gameObjects[key].id = key;
      obj.mount(this);
    });
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      const result = await eventHandler.init();
      if (result === "LOST_BATTLE") {
        break;
      }
    }
    this.isCutscenePlaying = false;
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      const relevantScenario = match.talking.find((scenario) => {
        return (scenario.required || []).every((sf) => {
          return playerState.storyFlags[sf];
        });
      });
      relevantScenario && this.startCutscene(relevantScenario.events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events);
    }
  }
}

window.OverworldMaps = {
  LivingRoom: {
    id: "LivingRoom",
    lowerSrc: "./images/maps/TPWGMaps/Living.png",
    upperSrc: "./images/maps/TPWGMaps/LivingUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(28),
        y: utils.withGrid(23),
        src: "./images/characters/people/Sister.png",
        scale: 0.9,
      },
      // npcA: {
      //   type: "Person",
      //   x: utils.withGrid(10),
      //   y: utils.withGrid(8),
      //   src: "./images/characters/people/npc1.png",
      //   behaviorLoop: [
      //     { type: "walk", direction: "left", },
      //     { type: "walk", direction: "down", },
      //     { type: "walk", direction: "right", },
      //     { type: "walk", direction: "up", },
      //     { type: "stand", direction: "up", time: 400, },
      //   ],
      //   talking: [
      //     {
      //       required: ["TALKED_TO_ERIO"],
      //       events: [
      //         { type: "textMessage", text: "Isn't Erio the coolest?", faceHero: "npcA" },
      //       ]
      //     },
      //     {
      //       events: [
      //         { type: "textMessage", text: "I'm going to crush you!", faceHero: "npcA" },
      //         { type: "battle", enemyId: "beth" },
      //         { type: "addStoryFlag", flag: "DEFEATED_BETH"},
      //         { type: "textMessage", text: "You crushed me like weak pepper.", faceHero: "npcA" },
      //         { type: "textMessage", text: "Go away!"},
      //          //{ who: "npcB", type: "walk",  direction: "up" },
      //       ]
      //     }
      //   ]
      // },
      // npcC: {
      //   type: "Person",
      //   x: utils.withGrid(4),
      //   y: utils.withGrid(8),
      //   src: "./images/characters/people/npc1.png",
      //   behaviorLoop: [
      //     { type: "stand", direction: "left", time: 500, },
      //     { type: "stand", direction: "down", time: 500, },
      //     { type: "stand", direction: "right", time: 500, },
      //     { type: "stand", direction: "up", time: 500, },
      //     { type: "walk", direction: "left",  },
      //     { type: "walk", direction: "down",  },
      //     { type: "walk", direction: "right",  },
      //     { type: "walk", direction: "up",  },
      //   ],
      // },
      // npcB: {
      //   type: "Person",
      //   x: utils.withGrid(8),
      //   y: utils.withGrid(5),
      //   src: "./images/characters/people/erio.png",
      //   talking: [
      //     {
      //       events: [
      //         { type: "textMessage", text: "Bahaha!", faceHero: "npcB" },
      //         { type: "addStoryFlag", flag: "TALKED_TO_ERIO"}
      //         //{ type: "battle", enemyId: "erio" }
      //       ]
      //     }
      //   ]
      // behaviorLoop: [
      //   { type: "walk",  direction: "left" },
      //   { type: "stand",  direction: "up", time: 800 },
      //   { type: "walk",  direction: "up" },
      //   { type: "walk",  direction: "right" },
      //   { type: "walk",  direction: "down" },
      // ]
      // },
      // pizzaStone: {
      //   type: "PizzaStone",
      //   x: utils.withGrid(2),
      //   y: utils.withGrid(7),
      //   storyFlag: "USED_PIZZA_STONE",
      //   pizzas: ["v001", "f001"],
      // },
    },
    walls: (function () {
      let walls = {};
      [
        // Top wall
        "4, 4",
        "5, 4",
        "6, 4",
        "7, 4",
        "8, 4",
        "9, 4",
        "10, 4",
        "11, 4",
        "12, 4",
        "13, 4",
        "14, 4",
        "15, 4",
        "15, 5",
        "15, 6",
        "15, 7",
        "16, 4",
        "17, 4",
        "18, 4",
        "19, 4",
        "20, 4",
        "21, 4",
        "22, 4",
        "23, 4",
        "24, 4",
        // Dividing wall to balcony
        "24, 5",
        "24, 6",
        "24, 7",
        "24, 8",
        "24, 9",
        "24, 10",
        "24, 11",
        "24, 12",
        "24, 13",
        "24, 14",
        // Balcony balastrade
        "25, 8",
        "26, 8",
        "27, 8",
        "28, 8",
        // Kitchen wall
        "28, 9",
        "28, 10",
        "28, 11",
        "28, 12",
        "28, 13",
        "28, 14",
        "29, 15",
        "30, 16",
        "29, 17",
        "29, 18",
        "29, 19",
        "29, 20",
        "29, 21",
        "29, 22",
        "30, 23",
        "29, 24",
        "28, 25",
        "27, 26",
        "26, 25",
        "25, 25",
        "24, 24",
        "23, 23",
        "24, 22",
        "24, 21",
        "24, 20",
        // Middle bottom wall
        "24, 19",
        "23, 19",
        "22, 19",
        "21, 19",
        "20, 19",
        // Entrance Hallway
        "20, 20",
        "20, 21",
        "20, 22",
        "20, 23",
        "20, 24",
        "20, 25",
        "20, 26",
        "20, 27",
        "19, 28",
        "18, 28",
        "17, 29",
        "16, 28",
        "15, 28",
        "14, 27",
        "14, 26",
        "14, 25",
        "14, 24",
        "14, 23",
        "14, 22",
        "14, 21",
        "14, 20",
        // Left Bottom wall
        "14, 19",
        "13, 19",
        "12, 19",
        "11, 19",
        "10, 19",
        "9, 19",
        "8, 19",
        "7, 19",
        "6, 19",
        "5, 19",
        "4, 19",
        // Left wall
        "3, 4",
        "3, 5",
        "3, 6",
        "3, 7",
        "3, 8",
        "3, 9",
        "3, 10",
        "3, 11",
        "3, 12",
        "3, 13",
        "3, 14",
        "3, 15",
        "3, 16",
        "3, 17",
        "3, 18",
        "3, 19",
        // Assets
        // Study table and chair
        "5, 17",
        "5, 18",
        "6, 16",
        "6, 17",
        "6, 18",
        "7, 17",
        "7, 18",
        // Dining table and chairs
        "12, 11",
        "13, 9",
        "13, 10",
        "13, 11",
        "13, 12",
        "13, 13",
        "14, 10",
        "14, 11",
        "14, 12",
        "15, 9",
        "15, 10",
        "15, 11",
        "15, 12",
        "15, 13",
        "16, 10",
        "16, 11",
        "16, 12",
        "17, 9",
        "17, 10",
        "17, 11",
        "17, 12",
        "17, 13",
        "18, 11",
        // Bar stools
        "23, 9",
        "23, 11",
        "23, 13",
        // Piano
        "6, 5",
        "7, 5",
        "7, 6",
        "8, 5",
        // Sofa
        "11, 5",
        "12, 5",
      ].forEach((coord) => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      });
      return walls;
    })(),
    cutsceneSpaces: {
      //   [utils.asGridCoord(7,4)]: [
      //     {
      //       events: [
      //         { who: "npcB", type: "walk",  direction: "left" },
      //         { who: "npcB", type: "stand",  direction: "up", time: 500 },
      //         { type: "textMessage", text:"You can't be in there!"},
      //         { who: "npcB", type: "walk",  direction: "right" },
      //         { who: "hero", type: "walk",  direction: "down" },
      //         { who: "hero", type: "walk",  direction: "left" },
      //       ]
      //     }
      //   ],
      [utils.asGridCoord(29, 16)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Kid",
              x: utils.withGrid(1),
              y: utils.withGrid(13),
              direction: "right",
            },
          ],
        },
      ],
      [utils.asGridCoord(29, 23)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Bathroom",
              x: utils.withGrid(1),
              y: utils.withGrid(8),
              direction: "right",
            },
          ],
        },
      ],
      [utils.asGridCoord(27, 25)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "MasterBedroom",
              x: utils.withGrid(8),
              y: utils.withGrid(3),
              direction: "down",
            },
          ],
        },
      ],
      [utils.asGridCoord(24, 23)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Laundry",
              x: utils.withGrid(6),
              y: utils.withGrid(8),
              direction: "left",
            },
          ],
        },
      ],
    },
  },
  Kid: {
    id: "Kid",
    lowerSrc: "./images/maps/TPWGMaps/Kid.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(1),
        y: utils.withGrid(9),
        src: "./images/characters/people/Sister.png",
        scale: 0.9,
      },
    },
    walls: (function () {
      let walls = {};
      [
        // Top wall
        "2, 4",
        "3, 4",
        "4, 4",
        "5, 4",
        "6, 4",
        "7, 4",
        "8, 4",
        "9, 4",
        // Right wall
        "10, 5",
        "10, 6",
        "10, 7",
        "10, 8",
        "10, 9",
        "10, 10",
        "10, 11",
        "10, 12",
        "10, 13",
        "10, 14",
        "10, 15",
        // Bottom wall
        "2, 16",
        "3, 16",
        "4, 16",
        "5, 16",
        "6, 16",
        "7, 16",
        "8, 16",
        "9, 16",
        // Right wall
        // Left wall
        "1, 5",
        "1, 6",
        "1, 7",
        "1, 8",
        "1, 9",
        "1, 10",
        "1, 11",
        "1, 12",
        "0, 13",
        "1, 14",
        "1, 15",
        // Assets
        // Desk and chair
        "6, 14",
        "6, 15",
        "7, 13",
        "7 ,14",
        "7, 15",
        "8, 14",
        "8, 15",
        // Beds
        // Left
        "2, 5",
        "3, 5",
        "2, 6",
        "3, 6",
        "2, 7",
        "3, 7",
        // Right
        "7, 5",
        "8, 5",
        "7, 6",
        "8, 6",
        "7, 7",
        "8, 7",
      ].forEach((coord) => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      });
      return walls;
    })(),
    cutsceneSpaces: {
      [utils.asGridCoord(1, 13)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "LivingRoom",
              x: utils.withGrid(29),
              y: utils.withGrid(16),
              direction: "left",
            },
          ],
        },
      ],
    },
  },
  Bathroom: {
    id: "Bathroom",
    lowerSrc: "./images/maps/TPWGMaps/Bathroom.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(1),
        y: utils.withGrid(8),
        src: "./images/characters/people/Sister.png",
        scale: 0.9,
      },
    },
    walls: (function () {
      let walls = {};
      [
        // Top wall
        "2, 3",
        "3, 3",
        "4, 3",
        "5, 3",
        "6, 3",
        "7, 3",
        "8, 3",
        "9, 3",
        // Right wall
        "10, 4",
        "10, 5",
        "10, 6",
        "10, 7",
        "10, 8",
        "10, 9",
        "10, 10",
        // Bottom wall
        "2, 11",
        "3, 11",
        "4, 11",
        "5, 11",
        "6, 11",
        "7, 11",
        "8, 11",
        "9, 11",
        // Left wall
        // Right wall
        "1, 4",
        "1, 5",
        "1, 6",
        "1, 7",
        "0, 8",
        "1, 9",
        "1, 10",
        // Assets
      ].forEach((coord) => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      });
      return walls;
    })(),
    cutsceneSpaces: {
      [utils.asGridCoord(1, 8)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "LivingRoom",
              x: utils.withGrid(29),
              y: utils.withGrid(23),
              direction: "left",
            },
          ],
        },
      ],
    },
  },
  MasterBedroom: {
    id: "MasterBedroom",
    lowerSrc: "./images/maps/TPWGMaps/MasterBedroom.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(8),
        y: utils.withGrid(3),
        src: "./images/characters/people/Sister.png",
        scale: 0.9,
      },
    },
    walls: (function () {
      let walls = {};
      [
        // Top wall
        "1, 3",
        "2, 3",
        "3, 3",
        "4, 3",
        "5, 3",
        "6, 3",
        "7, 3",
        "8, 2",
        "9, 3",
        // Right wall
        "10, 4",
        "10, 5",
        "10, 6",
        "10, 7",
        "10, 8",
        "10, 9",
        "10, 10",
        "10, 11",
        // Bottom wall
        "1, 12",
        "2, 12",
        "3, 12",
        "4, 12",
        "5, 12",
        "6, 12",
        "7, 12",
        "8, 12",
        "9, 12",
        // Left wall
        "0, 4",
        "0, 5",
        "0, 6",
        "0, 7",
        "0, 8",
        "0, 9",
        "0, 10",
        "0, 11",
        // Assets
        // Closet
        "1, 4",
        "2, 4",
        "3, 4",
        "4, 4",
        "5, 4",
        // Stools
        // Upper
        "6, 4",
        // Lower
        "3, 11",
        // Bed
        "4, 8",
        "4, 9",
        "4, 10",
        "4, 11",
        "5, 8",
        "5, 9",
        "5, 10",
        "5, 11",
        "6, 8",
        "6, 9",
        "6, 10",
        "6, 11",
      ].forEach((coord) => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      });
      return walls;
    })(),
    cutsceneSpaces: {
      [utils.asGridCoord(8, 3)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "LivingRoom",
              x: utils.withGrid(27),
              y: utils.withGrid(25),
              direction: "up",
            },
          ],
        },
      ],
    },
  },
  Laundry: {
    id: "Laundry",
    lowerSrc: "./images/maps/TPWGMaps/Laundry.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(9),
        y: utils.withGrid(5),
        src: "./images/characters/people/Sister.png",
        scale: 0.9,
      },
    },
    walls: (function () {
      let walls = {};
      [
        // Top wall
        "1, 3",
        "2, 3",
        "3, 3",
        "4, 3",
        "5, 3",
        // Right wall
        "6, 4",
        "6, 5",
        "6, 6",
        "6, 7",
        "7, 8",
        "6, 9",
        // Bottom wall
        "1, 10",
        "2, 10",
        "3, 10",
        "4, 10",
        "5, 10",
        // Left wall
        "0, 4",
        "0, 5",
        "0, 6",
        "0, 7",
        "0, 8",
        "0, 9",
        // Assets
      ].forEach((coord) => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      });
      return walls;
    })(),
    cutsceneSpaces: {
      [utils.asGridCoord(6, 8)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "LivingRoom",
              x: utils.withGrid(24),
              y: utils.withGrid(23),
              direction: "right",
            },
          ],
        },
      ],
    },
  },

  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "./images/maps/DemoLower.png",
    upperSrc: "./images/maps/DemoUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(23),
        y: utils.withGrid(23),
      },
      npcA: {
        type: "Person",
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "./images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: 400 },
        ],
        talking: [
          {
            required: ["TALKED_TO_ERIO"],
            events: [
              {
                type: "textMessage",
                text: "Isn't Erio the coolest?",
                faceHero: "npcA",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "I'm going to crush you!",
                faceHero: "npcA",
              },
              { type: "battle", enemyId: "beth" },
              { type: "addStoryFlag", flag: "DEFEATED_BETH" },
              {
                type: "textMessage",
                text: "You crushed me like weak pepper.",
                faceHero: "npcA",
              },
              { type: "textMessage", text: "Go away!" },
              //{ who: "npcB", type: "walk",  direction: "up" },
            ],
          },
        ],
      },
      npcC: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(8),
        src: "./images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 500 },
          { type: "stand", direction: "down", time: 500 },
          { type: "stand", direction: "right", time: 500 },
          { type: "stand", direction: "up", time: 500 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "up" },
        ],
      },
      npcB: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "./images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Bahaha!", faceHero: "npcB" },
              { type: "addStoryFlag", flag: "TALKED_TO_ERIO" },
              //{ type: "battle", enemyId: "erio" }
            ],
          },
        ],
        // behaviorLoop: [
        //   { type: "walk",  direction: "left" },
        //   { type: "stand",  direction: "up", time: 800 },
        //   { type: "walk",  direction: "up" },
        //   { type: "walk",  direction: "right" },
        //   { type: "walk",  direction: "down" },
        // ]
      },
      pizzaStone: {
        type: "PizzaStone",
        x: utils.withGrid(2),
        y: utils.withGrid(7),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: ["v001", "f001"],
      },
    },
    walls: {
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            { who: "npcB", type: "walk", direction: "left" },
            { who: "npcB", type: "stand", direction: "up", time: 500 },
            { type: "textMessage", text: "You can't be in there!" },
            { who: "npcB", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
          ],
        },
      ],
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Kitchen",
              x: utils.withGrid(2),
              y: utils.withGrid(2),
              direction: "down",
            },
          ],
        },
      ],
    },
  },
  Kitchen: {
    id: "Kitchen",
    lowerSrc: "./images/maps/KitchenLower.png",
    upperSrc: "./images/maps/KitchenUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(9),
      },
      kitchenNpcA: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(5),
        direction: "up",
        src: "./images/characters/people/npc8.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "** They don't want to talk to you **",
              },
            ],
          },
        ],
      },
      kitchenNpcB: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "./images/characters/people/npc3.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "People take their jobs here very seriously.",
                faceHero: "kitchenNpcB",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: 500 },
          { type: "stand", direction: "left", time: 500 },
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "DiningRoom",
              x: utils.withGrid(7),
              y: utils.withGrid(3),
              direction: "down",
            },
          ],
        },
      ],
      [utils.asGridCoord(10, 6)]: [
        {
          disqualify: ["SEEN_INTRO"],
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO" },
            {
              type: "textMessage",
              text: "* You are chopping ingredients on your first day as a Pizza Chef at a famed establishment in town. *",
            },
            { type: "walk", who: "kitchenNpcA", direction: "down" },
            {
              type: "stand",
              who: "kitchenNpcA",
              direction: "right",
              time: 200,
            },
            { type: "stand", who: "hero", direction: "left", time: 200 },
            { type: "textMessage", text: "Ahem. Is this your best work?" },
            {
              type: "textMessage",
              text: "These pepperonis are completely unstable! The pepper shapes are all wrong!",
            },
            {
              type: "textMessage",
              text: "Don't even get me started on the mushrooms.",
            },
            { type: "textMessage", text: "You will never make it in pizza!" },
            {
              type: "stand",
              who: "kitchenNpcA",
              direction: "right",
              time: 200,
            },
            { type: "walk", who: "kitchenNpcA", direction: "up" },
            { type: "stand", who: "kitchenNpcA", direction: "up", time: 300 },
            { type: "stand", who: "hero", direction: "down", time: 400 },
            {
              type: "textMessage",
              text: "* The competition is fierce! You should spend some time leveling up your Pizza lineup and skills. *",
            },
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "down",
            },
          ],
        },
      ],
    },
    walls: {
      [utils.asGridCoord(2, 4)]: true,
      [utils.asGridCoord(3, 4)]: true,
      [utils.asGridCoord(5, 4)]: true,
      [utils.asGridCoord(6, 4)]: true,
      [utils.asGridCoord(7, 4)]: true,
      [utils.asGridCoord(8, 4)]: true,
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(12, 5)]: true,
      [utils.asGridCoord(1, 5)]: true,
      [utils.asGridCoord(1, 6)]: true,
      [utils.asGridCoord(1, 7)]: true,
      [utils.asGridCoord(1, 9)]: true,
      [utils.asGridCoord(2, 9)]: true,
      [utils.asGridCoord(6, 7)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(9, 7)]: true,
      [utils.asGridCoord(10, 7)]: true,
      [utils.asGridCoord(9, 9)]: true,
      [utils.asGridCoord(10, 9)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(6, 10)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(11, 10)]: true,
      [utils.asGridCoord(12, 10)]: true,

      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(5, 11)]: true,

      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(9, 4)]: true,
      [utils.asGridCoord(10, 4)]: true,

      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(13, 7)]: true,
      [utils.asGridCoord(13, 8)]: true,
      [utils.asGridCoord(13, 9)]: true,
    },
  },
  Street: {
    id: "Street",
    lowerSrc: "./images/maps/StreetLower.png",
    upperSrc: "./images/maps/StreetUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(30),
        y: utils.withGrid(10),
      },
      streetNpcA: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(11),
        src: "./images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 1400 },
          { type: "stand", direction: "up", time: 900 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "All ambitious pizza chefs gather on Anchovy Avenue.",
                faceHero: "streetNpcA",
              },
            ],
          },
        ],
      },
      streetNpcB: {
        type: "Person",
        x: utils.withGrid(31),
        y: utils.withGrid(12),
        src: "./images/characters/people/npc7.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "down", time: 400 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "right", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I can't decide on my favorite toppings.",
                faceHero: "streetNpcB",
              },
            ],
          },
        ],
      },
      streetNpcC: {
        type: "Person",
        x: utils.withGrid(22),
        y: utils.withGrid(10),
        src: "./images/characters/people/npc8.png",
        talking: [
          {
            required: ["streetBattle"],
            events: [
              {
                type: "textMessage",
                text: "You are quite capable.",
                faceHero: "streetNpcC",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "You should have just stayed home!",
                faceHero: "streetNpcC",
              },
              { type: "battle", enemyId: "streetBattle" },
              { type: "addStoryFlag", flag: "streetBattle" },
            ],
          },
        ],
      },
    },
    walls: (function () {
      let walls = {};
      [
        "4,9",
        "5,8",
        "6,9",
        "7,9",
        "8,9",
        "9,9",
        "10,9",
        "11,9",
        "12,9",
        "13,8",
        "14,8",
        "15,7",
        "16,7",
        "17,7",
        "18,7",
        "19,7",
        "20,7",
        "21,7",
        "22,7",
        "23,7",
        "24,7",
        "24,6",
        "24,5",
        "26,5",
        "26,6",
        "26,7",
        "27,7",
        "28,8",
        "28,9",
        "29,8",
        "30,9",
        "31,9",
        "32,9",
        "33,9",
        "16,9",
        "17,9",
        "25,9",
        "26,9",
        "16,10",
        "17,10",
        "25,10",
        "26,10",
        "16,11",
        "17,11",
        "25,11",
        "26,11",
        "18,11",
        "19,11",
        "4,14",
        "5,14",
        "6,14",
        "7,14",
        "8,14",
        "9,14",
        "10,14",
        "11,14",
        "12,14",
        "13,14",
        "14,14",
        "15,14",
        "16,14",
        "17,14",
        "18,14",
        "19,14",
        "20,14",
        "21,14",
        "22,14",
        "23,14",
        "24,14",
        "25,14",
        "26,14",
        "27,14",
        "28,14",
        "29,14",
        "30,14",
        "31,14",
        "32,14",
        "33,14",
        "3,10",
        "3,11",
        "3,12",
        "3,13",
        "34,10",
        "34,11",
        "34,12",
        "34,13",
        "29,8",
        "25,4",
      ].forEach((coord) => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      });
      return walls;
    })(),
    cutsceneSpaces: {
      [utils.asGridCoord(5, 9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "DiningRoom",
              x: utils.withGrid(6),
              y: utils.withGrid(12),
              direction: "up",
            },
          ],
        },
      ],
      [utils.asGridCoord(29, 9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Shop",
              x: utils.withGrid(5),
              y: utils.withGrid(12),
              direction: "up",
            },
          ],
        },
      ],
      [utils.asGridCoord(25, 5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "StreetNorth",
              x: utils.withGrid(7),
              y: utils.withGrid(16),
              direction: "up",
            },
          ],
        },
      ],
    },
  },
  Shop: {
    id: "Shop",
    lowerSrc: "./images/maps/PizzaShopLower.png",
    upperSrc: "./images/maps/PizzaShopUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(7),
      },
      shopNpcA: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(5),
        src: "./images/characters/people/erio.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "All of the chef rivalries have been good for business.",
                faceHero: "shopNpcA",
              },
            ],
          },
        ],
      },
      shopNpcB: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(9),
        src: "./images/characters/people/npc2.png",
        behaviorLoop: [{ type: "stand", direction: "left", time: 400 }],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Which peel will make me a better chef?",
                faceHero: "shopNpcB",
              },
            ],
          },
        ],
      },
      pizzaStone: {
        type: "PizzaStone",
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        storyFlag: "STONE_SHOP",
        pizzas: ["v002", "f002"],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5, 12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(29),
              y: utils.withGrid(9),
              direction: "down",
            },
          ],
        },
      ],
    },
    walls: {
      [utils.asGridCoord(2, 4)]: true,
      [utils.asGridCoord(2, 5)]: true,
      [utils.asGridCoord(2, 6)]: true,
      [utils.asGridCoord(3, 6)]: true,
      [utils.asGridCoord(4, 6)]: true,
      [utils.asGridCoord(5, 6)]: true,
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(9, 6)]: true,
      [utils.asGridCoord(9, 5)]: true,
      [utils.asGridCoord(9, 4)]: true,
      [utils.asGridCoord(3, 8)]: true,
      [utils.asGridCoord(3, 9)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(4, 8)]: true,
      [utils.asGridCoord(4, 9)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(7, 8)]: true,
      [utils.asGridCoord(7, 9)]: true,
      [utils.asGridCoord(8, 8)]: true,
      [utils.asGridCoord(8, 9)]: true,
      [utils.asGridCoord(1, 12)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(3, 12)]: true,
      [utils.asGridCoord(4, 12)]: true,
      [utils.asGridCoord(6, 12)]: true,
      [utils.asGridCoord(7, 12)]: true,
      [utils.asGridCoord(8, 12)]: true,
      [utils.asGridCoord(9, 12)]: true,
      [utils.asGridCoord(10, 12)]: true,
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(11, 7)]: true,
      [utils.asGridCoord(11, 8)]: true,
      [utils.asGridCoord(11, 9)]: true,
      [utils.asGridCoord(11, 10)]: true,
      [utils.asGridCoord(11, 11)]: true,

      [utils.asGridCoord(1, 3)]: true,
      [utils.asGridCoord(2, 3)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 3)]: true,
      [utils.asGridCoord(7, 3)]: true,
      [utils.asGridCoord(8, 3)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(10, 3)]: true,

      [utils.asGridCoord(5, 13)]: true,
    },
  },
  GreenKitchen: {
    id: "GreenKitchen",
    lowerSrc: "./images/maps/GreenKitchenLower.png",
    upperSrc: "./images/maps/GreenKitchenUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(8),
      },
      greenKitchenNpcA: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(8),
        src: "./images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "down", time: 400 },
          { type: "stand", direction: "left", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Chef Rootie uses the best seasoning.",
                faceHero: "greenKitchenNpcA",
              },
            ],
          },
        ],
      },
      greenKitchenNpcB: {
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(8),
        src: "./images/characters/people/npc3.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 900 },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "stand", direction: "right", time: 800 },
          { type: "stand", direction: "down", time: 400 },
          { type: "stand", direction: "right", time: 800 },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: 600 },
          { type: "stand", direction: "right", time: 900 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Finally... a pizza place that gets me!",
                faceHero: "greenKitchenNpcB",
              },
            ],
          },
        ],
      },
      greenKitchenNpcC: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "./images/characters/people/secondBoss.png",
        talking: [
          {
            required: ["chefRootie"],
            events: [
              {
                type: "textMessage",
                faceHero: ["greenKitchenNpcC"],
                text: "My veggies need more growth.",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "Veggies are the fuel for the heart and soul!",
                faceHero: "greenKitchenNpcC",
              },
              { type: "battle", enemyId: "chefRootie", arena: "green-kitchen" },
              { type: "addStoryFlag", flag: "chefRootie" },
            ],
          },
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5, 12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "StreetNorth",
              x: utils.withGrid(7),
              y: utils.withGrid(5),
              direction: "down",
            },
          ],
        },
      ],
    },
    walls: {
      [utils.asGridCoord(1, 4)]: true,
      [utils.asGridCoord(3, 4)]: true,
      [utils.asGridCoord(4, 4)]: true,
      [utils.asGridCoord(6, 4)]: true,
      [utils.asGridCoord(7, 4)]: true,
      [utils.asGridCoord(8, 5)]: true,
      [utils.asGridCoord(9, 4)]: true,
      [utils.asGridCoord(1, 6)]: true,
      [utils.asGridCoord(2, 6)]: true,
      [utils.asGridCoord(3, 6)]: true,
      [utils.asGridCoord(4, 6)]: true,
      [utils.asGridCoord(5, 6)]: true,
      [utils.asGridCoord(6, 6)]: true,
      [utils.asGridCoord(3, 7)]: true,
      [utils.asGridCoord(4, 7)]: true,
      [utils.asGridCoord(6, 7)]: true,
      [utils.asGridCoord(2, 9)]: true,
      [utils.asGridCoord(3, 9)]: true,
      [utils.asGridCoord(4, 9)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(1, 12)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(3, 12)]: true,
      [utils.asGridCoord(4, 12)]: true,
      [utils.asGridCoord(6, 12)]: true,
      [utils.asGridCoord(7, 12)]: true,
      [utils.asGridCoord(8, 12)]: true,
      [utils.asGridCoord(9, 12)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(10, 5)]: true,
      [utils.asGridCoord(10, 6)]: true,
      [utils.asGridCoord(10, 7)]: true,
      [utils.asGridCoord(10, 8)]: true,
      [utils.asGridCoord(10, 9)]: true,
      [utils.asGridCoord(10, 10)]: true,
      [utils.asGridCoord(10, 11)]: true,
      [utils.asGridCoord(5, 13)]: true,
    },
  },
  StreetNorth: {
    id: "StreetNorth",
    lowerSrc: "./images/maps/StreetNorthLower.png",
    upperSrc: "./images/maps/StreetNorthUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(8),
      },
      streetNorthNpcA: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(6),
        src: "./images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "right", time: 800 },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: 400 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "This place is famous for veggie pizzas!",
                faceHero: "streetNorthNpcA",
              },
            ],
          },
        ],
      },
      streetNorthNpcB: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(12),
        src: "./images/characters/people/npc3.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "down", time: 400 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "right", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I love the fresh smell of garlic in the air.",
                faceHero: "streetNorthNpcB",
              },
            ],
          },
        ],
      },
      streetNorthNpcC: {
        type: "Person",
        x: utils.withGrid(12),
        y: utils.withGrid(9),
        src: "./images/characters/people/npc8.png",
        talking: [
          {
            required: ["streetNorthBattle"],
            events: [
              {
                type: "textMessage",
                text: "Could you be the Legendary one?",
                faceHero: "streetNorthNpcC",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "This is my turf!",
                faceHero: "streetNorthNpcC",
              },
              { type: "battle", enemyId: "streetNorthBattle" },
              { type: "addStoryFlag", flag: "streetNorthBattle" },
            ],
          },
        ],
      },
      pizzaStone: {
        type: "PizzaStone",
        x: utils.withGrid(2),
        y: utils.withGrid(9),
        storyFlag: "STONE_STREET_NORTH",
        pizzas: ["v001", "f001"],
      },
    },
    walls: {
      [utils.asGridCoord(2, 7)]: true,
      [utils.asGridCoord(3, 7)]: true,
      [utils.asGridCoord(3, 6)]: true,
      [utils.asGridCoord(4, 5)]: true,
      [utils.asGridCoord(5, 5)]: true,
      [utils.asGridCoord(6, 5)]: true,
      [utils.asGridCoord(8, 5)]: true,
      [utils.asGridCoord(9, 5)]: true,
      [utils.asGridCoord(10, 5)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(12, 6)]: true,
      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(7, 8)]: true,
      [utils.asGridCoord(8, 8)]: true,
      [utils.asGridCoord(7, 9)]: true,
      [utils.asGridCoord(8, 9)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(10, 10)]: true,
      [utils.asGridCoord(2, 15)]: true,
      [utils.asGridCoord(3, 15)]: true,
      [utils.asGridCoord(4, 15)]: true,
      [utils.asGridCoord(5, 15)]: true,
      [utils.asGridCoord(6, 15)]: true,
      [utils.asGridCoord(6, 16)]: true,
      [utils.asGridCoord(8, 16)]: true,
      [utils.asGridCoord(8, 15)]: true,
      [utils.asGridCoord(9, 15)]: true,
      [utils.asGridCoord(10, 15)]: true,
      [utils.asGridCoord(11, 15)]: true,
      [utils.asGridCoord(12, 15)]: true,
      [utils.asGridCoord(13, 15)]: true,

      [utils.asGridCoord(1, 8)]: true,
      [utils.asGridCoord(1, 9)]: true,
      [utils.asGridCoord(1, 10)]: true,
      [utils.asGridCoord(1, 11)]: true,
      [utils.asGridCoord(1, 12)]: true,
      [utils.asGridCoord(1, 13)]: true,
      [utils.asGridCoord(1, 14)]: true,

      [utils.asGridCoord(14, 7)]: true,
      [utils.asGridCoord(14, 8)]: true,
      [utils.asGridCoord(14, 9)]: true,
      [utils.asGridCoord(14, 10)]: true,
      [utils.asGridCoord(14, 11)]: true,
      [utils.asGridCoord(14, 12)]: true,
      [utils.asGridCoord(14, 13)]: true,
      [utils.asGridCoord(14, 14)]: true,

      [utils.asGridCoord(7, 17)]: true,
      [utils.asGridCoord(7, 4)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "GreenKitchen",
              x: utils.withGrid(5),
              y: utils.withGrid(12),
              direction: "up",
            },
          ],
        },
      ],
      [utils.asGridCoord(7, 16)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(25),
              y: utils.withGrid(5),
              direction: "down",
            },
          ],
        },
      ],
    },
  },
  DiningRoom: {
    id: "DiningRoom",
    lowerSrc: "./images/maps/DiningRoomLower.png",
    upperSrc: "./images/maps/DiningRoomUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(8),
      },
      diningRoomNpcA: {
        type: "Person",
        x: utils.withGrid(12),
        y: utils.withGrid(8),
        src: "./images/characters/people/npc8.png",
        talking: [
          {
            required: ["diningRoomBattle"],
            events: [
              {
                type: "textMessage",
                text: "Maybe I am not ready for this place.",
                faceHero: "diningRoomNpcA",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "You think you have what it takes to cook here?!",
                faceHero: "diningRoomNpcA",
              },
              {
                type: "battle",
                enemyId: "diningRoomBattle",
                arena: "dining-room",
              },
              { type: "addStoryFlag", flag: "diningRoomBattle" },
            ],
          },
        ],
      },
      diningRoomNpcB: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(5),
        src: "./images/characters/people/npc4.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "People come from all over to dine here.",
                faceHero: "diningRoomNpcB",
              },
            ],
          },
        ],
      },
      diningRoomNpcC: {
        type: "Person",
        x: utils.withGrid(2),
        y: utils.withGrid(8),
        src: "./images/characters/people/npc7.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 800 },
          { type: "stand", direction: "down", time: 700 },
          { type: "stand", direction: "right", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I was so lucky to score a reservation!",
                faceHero: "diningRoomNpcC",
              },
            ],
          },
        ],
      },
      diningRoomNpcD: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(9),
        src: "./images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 1200 },
          { type: "stand", direction: "down", time: 900 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "down", time: 700 },
          { type: "stand", direction: "right", time: 400 },
          { type: "stand", direction: "up", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I've been dreaming of this pizza for weeks!",
                faceHero: "diningRoomNpcD",
              },
            ],
          },
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 3)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Kitchen",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up",
            },
          ],
        },
      ],
      [utils.asGridCoord(6, 12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(5),
              y: utils.withGrid(9),
              direction: "down",
            },
          ],
        },
      ],
    },
    walls: {
      [utils.asGridCoord(7, 2)]: true,
      [utils.asGridCoord(6, 13)]: true,
      [utils.asGridCoord(1, 5)]: true,
      [utils.asGridCoord(2, 5)]: true,
      [utils.asGridCoord(3, 5)]: true,
      [utils.asGridCoord(4, 5)]: true,
      [utils.asGridCoord(4, 4)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 4)]: true,
      [utils.asGridCoord(6, 5)]: true,
      [utils.asGridCoord(8, 3)]: true,
      [utils.asGridCoord(9, 4)]: true,
      [utils.asGridCoord(10, 5)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(12, 5)]: true,
      [utils.asGridCoord(11, 7)]: true,
      [utils.asGridCoord(12, 7)]: true,
      [utils.asGridCoord(2, 7)]: true,
      [utils.asGridCoord(3, 7)]: true,
      [utils.asGridCoord(4, 7)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
      [utils.asGridCoord(9, 7)]: true,
      [utils.asGridCoord(2, 10)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(1, 12)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(3, 12)]: true,
      [utils.asGridCoord(4, 12)]: true,
      [utils.asGridCoord(5, 12)]: true,
      [utils.asGridCoord(7, 12)]: true,
      [utils.asGridCoord(8, 12)]: true,
      [utils.asGridCoord(9, 12)]: true,
      [utils.asGridCoord(10, 12)]: true,
      [utils.asGridCoord(11, 12)]: true,
      [utils.asGridCoord(12, 12)]: true,
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(13, 4)]: true,
      [utils.asGridCoord(13, 5)]: true,
      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(13, 8)]: true,
      [utils.asGridCoord(13, 9)]: true,
      [utils.asGridCoord(13, 10)]: true,
      [utils.asGridCoord(13, 11)]: true,
    },
  },
};
