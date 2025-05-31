class DirectionInput {
  constructor() {
    this.heldDirections = [];

    this.map = {
      ArrowUp: "up",
      KeyW: "up",
      ArrowDown: "down",
      KeyS: "down",
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
    };

    this.enabled = true;
  }

  get direction() {
    return this.enabled ? this.heldDirections[0] : null;
  }

  init() {
    document.addEventListener("keydown", (e) => {
      if (!this.enabled) return;
      const dir = this.map[e.code];
      if (dir && this.heldDirections.indexOf(dir) === -1) {
        this.heldDirections.unshift(dir);
      }
    });
    document.addEventListener("keyup", (e) => {
      if (!this.enabled) return;
      const dir = this.map[e.code];
      const index = this.heldDirections.indexOf(dir);
      if (index > -1) {
        this.heldDirections.splice(index, 1);
      }
    });
  }
}
