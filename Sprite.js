class Sprite {
  constructor(config) {
    //Set up the image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    };

    //Shadow
    this.shadow = new Image();
    this.useShadow = true; //config.useShadow || false
    if (this.useShadow) {
      this.shadow.src = "./images/characters/shadow.png";
    }
    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    };

    //Configure Animation & Initial State
    this.animations = config.animations || {
      "idle-down": [[0, 0]],
      "idle-right": [[0, 1]],
      "idle-up": [[0, 2]],
      "idle-left": [[0, 3]],
      "walk-down": [
        [1, 0],
        [0, 0],
        [3, 0],
        [0, 0],
      ],
      "walk-right": [
        [1, 1],
        [0, 1],
        [3, 1],
        [0, 1],
      ],
      "walk-up": [
        [1, 2],
        [0, 2],
        [3, 2],
        [0, 2],
      ],
      "walk-left": [
        [1, 3],
        [0, 3],
        [3, 3],
        [0, 3],
      ],
      "sit-down": [[0, 4]],
      "sit-right": [[1, 4]],
      "sit-up": [[2, 4]],
      "sit-left": [[3, 4]],
      "pick-up-down": [[0, 5]],
    };
    this.currentAnimation = config.currentAnimation || "idle-down";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 8;
    this.animationFrameProgress = this.animationFrameLimit;

    //Reference the game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame];
  }

  setAnimation(key) {
    if (typeof key !== "string") {
      console.warn("Animation key must be a string. Got:", key);
    }

    if (!this.animations[key]) {
      console.warn("Missing animation key:", key);
      const fallback = key.includes("idle") ? "idle-down" : "walk-down";
      key = this.animations[fallback]
        ? fallback
        : Object.keys(this.animations[0]);
    }
    if (this.currentAnimation !== key) {
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
    //Downtick frame progress
    if (this.animationFrameProgress > 0) {
      this.animationFrameProgress -= 1;
      return;
    }

    //Reset the counter
    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame += 1;

    if (this.frame === undefined) {
      this.currentAnimationFrame = 0;
    }
  }

  draw(ctx, cameraPerson) {
    if (this.isRemoved) return;
    // Calculate the drawing coordinates relative to the camera
    const x = this.gameObject.x - 10 + utils.withGrid(10.5) - cameraPerson.x;
    const y = this.gameObject.y - 23 + utils.withGrid(6) - cameraPerson.y;
    const scale = this.gameObject.scale || 1;

    this.isShadowLoaded && ctx.drawImage(this.shadow, x + 2, y + 4);

    const [frameX, frameY] = this.frame;

    if (this.isLoaded) {
      ctx.save();
      ctx.translate(x + 2, y + 2);
      ctx.scale(scale, scale);
      ctx.drawImage(this.image, frameX * 32, frameY * 32, 32, 32, 0, 0, 32, 32);
      ctx.restore();
    }

    this.updateAnimationProgress();
  }

  remove() {
    this.isRemoved = true;
    this.image = null;
    this.shadow = null;
    this.gameObject = null;
  }
}
