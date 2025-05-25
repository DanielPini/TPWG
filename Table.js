window.PLATE_NAMES = [
  "Plate",
  "Plate A",
  "Plate B",
  "Plate C",
  "Plate D",
  "Plate E",
  "Plate F",
  "Plate G",
];

window.CHOPSTICK_NAMES = [
  "Chopsticks",
  "Chopsticks A",
  "Chopsticks B",
  "Chopsticks C",
  "Chopsticks D",
  "Chopsticks E",
  "Chopsticks F",
  "Chopsticks G",
];

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
  { x: 7, y: 4 },
  { x: 9, y: 14 },
  { x: 11, y: 14 },
];

class Table extends GameObject {
  constructor(config) {
    super(config);
    this.placements = config.placements || []; // [{type: "Plate", x, y}, ...]
    this.sprite = null;
  }

  static isHeroFacingTable(hero) {
    const { x, y } = utils.nextPosition(hero.x, hero.y, hero.direction);
    const gridX = x / 16;
    const gridY = y / 16;
    console.log("Hero is facing:", gridX, gridY);
    console.log("Table squares:", window.TABLE_GRID_SQUARES);
    const match = window.TABLE_GRID_SQUARES.some(
      ([tx, ty]) => tx === gridX && ty === gridY
    );
    console.log("Match found:", match);
    return match;
  }

  interact() {
    // 1. Count how many plates/chopsticks are already placed
    const placedPlates = this.placements.filter(
      (p) => p.type === "Plate"
    ).length;
    const placedChopsticks = this.placements.filter(
      (p) => p.type === "Chopsticks"
    ).length;

    // 2. Count how many are in inventory
    const invPlates = playerState.inventory.filter((i) =>
      window.PLATE_NAMES.includes(i)
    ).length;
    const invChopsticks = playerState.inventory.filter((i) =>
      window.CHOPSTICK_NAMES.includes(i)
    ).length;

    // 3. Calculate how many to place (up to 8 each)
    const toPlacePlates = Math.min(8 - placedPlates, invPlates);
    const toPlaceChopsticks = Math.min(8 - placedChopsticks, invChopsticks);

    // 4. Place them on the table
    let placementIndex = 0;
    for (let i = 0; i < toPlacePlates; i++) {
      this.placements.push({
        type: "Plate",
        ...TABLE_PLACEMENT_POSITIONS[placementIndex++],
      });
      // Remove from inventory
      const idx = playerState.inventory.indexOf("Plate");
      if (idx > -1) playerState.inventory.splice(idx, 1);
    }
    for (let i = 0; i < toPlaceChopsticks; i++) {
      this.placements.push({
        type: "Chopsticks",
        ...TABLE_PLACEMENT_POSITIONS[placementIndex++],
      });
      const idx = playerState.inventory.indexOf("Chopsticks");
      if (idx > -1) playerState.inventory.splice(idx, 1);
    }

    // Completion check
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

  // Optionally, override draw() to render plates/chopsticks at placements
  draw(ctx, cameraPerson) {
    // Draw each placed object
    this.placements.forEach((placement) => {
      let img = new Image();
      if (placement.type === "Plate") {
        img.src = "./images/objects/Plates.png";
      } else if (placement.type === "Chopsticks") {
        img.src = "./images/objects/Chopsticks.png"; // Update path as needed
      }
      // Only draw if loaded
      img.onload = () => {
        ctx.drawImage(
          img,
          0,
          0,
          32,
          32, // source, x, y, width, height (top frame)
          placement.x * 32 - cameraPerson.x + utils.withGrid(10.5) - 10,
          placement.y * 32 - cameraPerson.y + utils.withGrid(6) - 23,
          32,
          32 // destination width, height
        );
      };
      // If already loaded from cache, draw immediately
      if (img.complete) {
        ctx.drawImage(
          img,
          0,
          0,
          32,
          32, // source, x, y, width, height (top frame)
          placement.x * 32 - cameraPerson.x + utils.withGrid(10.5) - 10,
          placement.y * 32 - cameraPerson.y + utils.withGrid(6) - 23,
          32,
          32
        );
      }
    });
  }
}
