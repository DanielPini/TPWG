class AppleBit {
  constructor({ startX, startY, endX, endY, frame, duration = 600 }) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.frame = frame; // which apple frame to use (starting from 1)
    this.duration = duration;
    this.startTime = null;
    this.done = false;
    this.currentX = startX;
    this.currentY = startY;
  }

  update(now) {
    if (!this.startTime) this.startTime = now;
    const t = Math.min((now - this.startTime) / this.duration, 1);

    // Arc: interpolate X linearly, Y as an arc (parabola)
    this.currentX = this.startX + (this.endX - this.startX) * t;
    const arcHeight = -40; // pixels above the straight line
    const linearY = this.startY + (this.endY - this.startY) * t;
    this.currentY = linearY + arcHeight * Math.sin(Math.PI * t);

    if (t === 1) this.done = true;
  }

  draw(ctx, appleImage) {
    // Use the correct frame for the apple bit (starting from 1)
    const [frameX, frameY] = window.Quests.chopFruit.applePhases[
      this.frame
    ] || [0, 0];
    ctx.drawImage(
      appleImage,
      frameX * 64,
      frameY * 64,
      64,
      64,
      this.currentX,
      this.currentY,
      64,
      64 // smaller for bits
    );
  }
}
