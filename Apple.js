class Apple {
  constructor({ src, phase }) {
    this.image = new Image();
    this.image.onload = () => {
      this.loaded = true;
    };
    this.image.src = src;
    this.phase = phase;
  }
  setPhase(phase) {
    this.phase = phase;
  }
  draw(ctx) {
    // Each phase is a frame in the spritesheet: [x, y]
    const [frameX, frameY] = window.Quests.chopFruit.applePhases[
      this.phase
    ] || [0, 0];
    ctx.drawImage(
      this.image,
      frameX * 64,
      frameY * 64,
      64,
      64,
      146,
      71,
      64,
      64
    );
  }
}
window.GameObjectClasses = window.GameObjectClasses || {};
window.GameObjectClasses["Apple"] = Apple;
