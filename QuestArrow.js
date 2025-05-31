class QuestArrow {
  constructor({ map, heroId = "hero" }) {
    this.map = map;
    this.heroId = heroId;
    this.target = null; // { x, y }
    this.canvas = null;
    this.ctx = null;
    this.visible = false;
    this.animationFrame = null;
    this.wasOutOfRange = true;
  }

  setTarget(target) {
    this.wasOutOfRange = true;
    this.target = target;
    console.log("Target for QuestArrow being set at:", this.target);
    this.show();
  }

  show() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
    this.createCanvas();
    console.log("Showing Quest arrow");
    this.visible = true;
    this.loop();
  }

  hide() {
    this.visible = false;
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    console.log("Hiding QuestArrow");
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  createCanvas() {
    const gameCanvas = document.querySelector(".game-canvas");
    if (!gameCanvas) {
      console.warn("No .game-canvas found for QuestArrow!");
      return;
    }
    this.canvas = document.createElement("canvas");
    this.canvas.width = gameCanvas.width;
    this.canvas.height = gameCanvas.height;
    this.canvas.style.position = "absolute";
    this.canvas.style.left = gameCanvas.offsetLeft + "px";
    this.canvas.style.top = gameCanvas.offsetTop + "px";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = 1000;
    this.ctx = this.canvas.getContext("2d");
    gameCanvas.parentNode.appendChild(this.canvas);
  }

  loop = () => {
    if (!this.visible) return;
    this.draw();
    this.animationFrame = requestAnimationFrame(this.loop);
  };

  drawTargetHighlight(ctx, target, cameraPerson) {
    const tileSize = 32; // or your grid size
    const screenX =
      target.x - cameraPerson.x + ctx.canvas.width / 2 - tileSize / 2;
    const screenY =
      target.y - cameraPerson.y + ctx.canvas.height / 2 - tileSize / 2;
    ctx.save();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 4;
    ctx.strokeRect(screenX, screenY, tileSize, tileSize);
    ctx.restore();
  }

  draw() {
    if (!this.target || !this.map) return;
    const hero = this.map.gameObjects[this.heroId];
    if (!hero) return;

    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.visible = true;

    // Get hero and target pixel positions (centered on sprite)
    const tileSize = 16; // or your grid size
    const camera = hero; // If you have a camera offset, adjust here

    // Convert map grid to screen pixel coordinates
    const heroScreenX = this.canvas.width / 2;
    const heroScreenY = this.canvas.height / 2;

    const dx = this.target.x - hero.x;
    const dy = this.target.y - hero.y;

    // Arrow endpoint (distance capped for visibility)
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 64; // or 96 for more separation from hero
    const arrowDist = Math.min(dist, maxDist); // or just: const arrowDist = maxDist;

    const angle = Math.atan2(dy, dx);

    const arrowX = heroScreenX + Math.cos(angle) * arrowDist;
    const arrowY = heroScreenY + Math.sin(angle) * arrowDist;

    // Draw arrow
    this.ctx.save();
    this.ctx.translate(arrowX, arrowY);
    this.ctx.rotate(angle);

    // Arrow body
    this.ctx.beginPath();
    this.ctx.moveTo(-10, 0);
    this.ctx.lineTo(-7, 0);
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 4;
    this.ctx.stroke();

    // Arrow head
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-7, -7);
    this.ctx.lineTo(-7, 7);
    this.ctx.closePath();
    this.ctx.fillStyle = "#000";
    this.ctx.fill();

    this.ctx.restore();
  }
}

window.QuestArrow = QuestArrow;
