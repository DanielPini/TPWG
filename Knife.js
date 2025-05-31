class Knife {
  constructor({ src }) {
    this.image = new Image();
    this.image.onload = () => {
      this.loaded = true;
    };
    this.image.src = src;
    this.frame = 0;
    this.animating = false;
  }

  animateChop(callback, isEnterHeldFn, onFrame3) {
    this.animating = true;
    this.frame = 0;
    const animate = () => {
      this.frame++;
      if (this.frame === 3 && onFrame3) {
        onFrame3(); // Call when entering frame 3
      }
      if (this.frame < 3) {
        setTimeout(animate, 60);
      } else {
        // Stay on last frame if Enter is held
        const waitForRelease = () => {
          if (isEnterHeldFn && isEnterHeldFn()) {
            setTimeout(waitForRelease, 16);
          } else {
            this.animating = false;
            this.frame = 0;
            callback && callback();
          }
        };
        waitForRelease();
      }
    };
    animate();
  }

  draw(ctx) {
    if (!this.loaded) return;
    // 4 frames, each 64x64, drawn above the apple
    ctx.drawImage(this.image, this.frame * 48, 0, 48, 128, 145, 51, 48, 128);
  }
}
window.GameObjectClasses = window.GameObjectClasses || {};
window.GameObjectClasses["Knife"] = Knife;
