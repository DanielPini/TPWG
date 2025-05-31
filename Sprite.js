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
    this.useShadow = config.useShadow !== undefined ? config.useShadow : true;
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
      fail: [
        [0, 8],
        [1, 8],
        [2, 8],
        [3, 8],
      ],
      "chop-right": [
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
      ],
    };
    this.currentAnimation = config.currentAnimation || "idle-down";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 8;
    this.animationFrameProgress = this.animationFrameLimit;

    //Reference the game object
    this.gameObject = config.gameObject;

    this.freezeAnimation = false;
  }

  get frame() {
    const frames = this.animations[this.currentAnimation];
    if (!frames) return [0, 0];
    return frames[this.currentAnimationFrame];
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
    if (this.freezeAnimation) return;
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
    let translateX, translateY;
    if (this.gameObject && this.gameObject.translateSprite) {
      [translateX, translateY] = this.gameObject.translateSprite;
    } else {
      translateX = 0;
      translateY = 0;
    }

    this.isShadowLoaded &&
      ctx.drawImage(this.shadow, x + 2 + translateX, y + 4 + translateY);

    const [frameX, frameY] = this.frame;

    if (this.isLoaded) {
      ctx.save();
      ctx.translate(x + 2 + translateX, y + 2 + translateY);
      ctx.scale(scale, scale);
      ctx.drawImage(this.image, frameX * 32, frameY * 32, 32, 32, 0, 0, 32, 32);
      ctx.restore();
    }

    this.updateAnimationProgress();
  }

  drawAt(ctx, x, y, cameraPerson) {
    if (this.isRemoved) return;
    const scale = this.gameObject?.scale || 1;
    let translateX, translateY;
    if (this.gameObject && this.gameObject.translateSprite) {
      [translateX, translateY] = this.gameObject.translateSprite;
    } else {
      translateX = 0;
      translateY = 0;
    }
    // Calculate screen position relative to camera
    const screenX = x - 10 + utils.withGrid(10.5) - cameraPerson.x;
    const screenY = y - 23 + utils.withGrid(6) - cameraPerson.y;

    // No shadow for pickup animation, or add a parameter if needed
    const [frameX, frameY] = this.frame;

    if (this.isLoaded) {
      ctx.save();
      ctx.translate(screenX + 2 + translateX, screenY - 3 + translateY);
      ctx.scale(scale, scale);
      ctx.drawImage(this.image, frameX * 32, frameY * 32, 32, 32, 0, 0, 32, 32);
      ctx.restore();
    }
  }

  remove() {
    this.isRemoved = true;
    this.image = null;
    this.shadow = null;
    this.gameObject = null;
  }
}
