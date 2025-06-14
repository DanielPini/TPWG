window.PLATE_NAMES = ["plate"];

window.CHOPSTICK_NAMES = ["chopstick"];

window.TABLE_GRID_SQUARES = [
  [7, 12],
  [8, 12],
  [9, 12],
  [10, 12],
  [11, 12],
  [7, 13],
  [8, 13],
  [9, 13],
  [10, 13],
  [11, 13],
  [7, 14],
  [8, 14],
  [9, 14],
  [10, 14],
  [11, 14],
];

window.TABLE_PLACEMENT_POSITIONS = [
  { x: 7, y: 12 },
  { x: 9, y: 12 },
  { x: 11, y: 12 },
  { x: 7, y: 13 },
  { x: 11, y: 13 },
  { x: 7, y: 14 },
  { x: 9, y: 14 },
  { x: 11, y: 14 },
];

const PLATE_IMG = new Image();
PLATE_IMG.src = "./images/objects/Plates.png";
const CHOPSTICKS_IMG = new Image();
CHOPSTICKS_IMG.src = "./images/objects/Chopsticks.png";

class Table extends GameObject {
  constructor(config) {
    super(config);
    if (
      playerState.storyFlags["PLATES_COLLECTED"] &&
      playerState.tablePlacements &&
      Array.isArray(playerState.tablePlacements)
    ) {
      this.placements = JSON.parse(JSON.stringify(playerState.tablePlacements));
    } else {
      this.placements = config.placements || []; // [{type: "Plate", x, y}, ...]
    }
    this.sprite = null;
  }

  static isHeroFacingTable(hero) {
    const { x, y } = utils.nextPosition(hero.x, hero.y, hero.direction);
    const gridX = x / 16;
    const gridY = y / 16;
    const match = window.TABLE_GRID_SQUARES.some(
      ([tx, ty]) => tx === gridX && ty === gridY
    );
    return match;
  }

  interact() {
    // For each placement position, try to place a plate and/or chopsticks
    window.TABLE_PLACEMENT_POSITIONS.forEach((pos) => {
      // Only place a plate if not already present at this position
      if (
        !this.placements.some(
          (p) => p.x === pos.x && p.y === pos.y && p.type === "Plate"
        )
      ) {
        const plateIdx = playerState.inventory.findIndex((item) =>
          window.PLATE_NAMES.includes(item)
        );
        if (plateIdx > -1) {
          this.placements.push({
            type: "Plate",
            state: "normal",
            x: pos.x,
            y: pos.y,
          });
          playerState.inventory.splice(plateIdx, 1);
        }
      }

      // Only place chopsticks if not already present at this position
      if (
        !this.placements.some(
          (p) => p.x === pos.x && p.y === pos.y && p.type === "Chopsticks"
        )
      ) {
        const chopIdx = playerState.inventory.findIndex((item) =>
          window.CHOPSTICK_NAMES.includes(item)
        );
        if (chopIdx > -1) {
          this.placements.push({
            type: "Chopsticks",
            x: pos.x,
            y: pos.y,
          });
          playerState.inventory.splice(chopIdx, 1);
        }
      }
    });

    if (
      this.placements.filter((p) => p.type === "Plate").length === 8 &&
      this.placements.filter((p) => p.type === "Chopsticks").length === 8
    ) {
      new TextMessage({
        text: "All set! Return to Jiejie to complete the quest.",
      }).init();
      playerState.storyFlags["TABLE_SET"] = true;
    }
  }

  breakAllPlacements(onCleared) {
    this.placements.forEach((p) => (p.state = "broken"));
    setTimeout(() => {
      this.placements = [];
      if (onCleared) onCleared();
    }, 2000);
  }

  // Optionally, override draw() to render plates/chopsticks at placements
  draw(ctx, cameraPerson) {
    const DRAW_SIZE = 28;
    const GRID_SIZE = 16;
    const OFFSET = GRID_SIZE - DRAW_SIZE / 2;
    const minY = 12;

    // Draw plates first, then chopsticks for each placement position
    window.TABLE_PLACEMENT_POSITIONS.forEach((pos) => {
      // Find plate and chopsticks at this position
      const plate = this.placements.find(
        (p) => p.x === pos.x && p.y === pos.y && p.type === "Plate"
      );
      const chopsticks = this.placements.find(
        (p) => p.x === pos.x && p.y === pos.y && p.type === "Chopsticks"
      );

      // Draw plate if present
      if (plate) {
        let sx = 0,
          sy = 0;
        let img = PLATE_IMG;
        if (plate.state === "broken") {
          sx = 0;
          sy = 4;
        }
        if (img && img.complete) {
          ctx.drawImage(
            img,
            sx * 32,
            sy * 32,
            32,
            32,
            pos.x * GRID_SIZE - cameraPerson.x + utils.withGrid(10) + OFFSET,
            pos.y * GRID_SIZE -
              cameraPerson.y +
              utils.withGrid(5) +
              OFFSET -
              7 -
              3 * (pos.y - minY),
            DRAW_SIZE,
            DRAW_SIZE
          );
        }
      }

      // Draw chopsticks if present
      if (chopsticks) {
        let sx = 0,
          sy = 0;
        let img = CHOPSTICKS_IMG;
        if (img && img.complete) {
          ctx.drawImage(
            img,
            sx * 32,
            sy * 32,
            32,
            32,
            pos.x * GRID_SIZE - cameraPerson.x + utils.withGrid(10) + OFFSET,
            pos.y * GRID_SIZE -
              cameraPerson.y +
              utils.withGrid(5) +
              OFFSET -
              7 -
              3 * (pos.y - minY),
            DRAW_SIZE,
            DRAW_SIZE
          );
        }
      }
    });
  }
}
