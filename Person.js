class Person extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.isSitting = config.isSitting || false;
    this.isPickingUp = false;

    this.intentPosition = null; //[x,y]

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
    this.standBehaviorTimeout;
    this.sitBehaviorTimeout;
    this.previousDirection = this.direction;
    this.lockedAnimation = null;
  }

  update(state) {
    if (!this.direction) {
      this.direction = this.previousDirection || "down";
    }
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      //We're keyboard ready and have an arrow pressed
      if (
        !state.map.isCutscenePlaying &&
        this.isPlayerControlled &&
        state.arrow
      ) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow,
        });
      }
      if (!this.isPickingUp) {
        this.updateSprite(state);
      }
    }
  }

  startBehavior(state, behavior) {
    if (!this.isMounted) {
      return;
    }

    // Clear any existing stand timeout before starting a new behavior
    if (this.standBehaviorTimeout) {
      clearTimeout(this.standBehaviorTimeout);
      this.standBehaviorTimeout = null;
    }

    //Set character direction to whatever behavior has
    if (behavior.type !== "sit") {
      this.direction = behavior.direction;
    }

    if (behavior.type === "walk") {
      //Stop here if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction, this.id)) {
        // If NPC, stand for a bit before retrying
        if (!this.isPlayerControlled) {
          this.startBehavior(state, {
            type: "stand",
            direction: this.direction,
            time: 400,
            onComplete: () => {
              this.startBehavior(state, behavior);
            },
          });
        }
        // If player, use retry logic as before
        if (behavior.retry) {
          setTimeout(() => {
            if (
              this.isPlayerControlled &&
              state.arrow === behavior.direction &&
              !state.map.isCutscenePlaying
            ) {
              this.startBehavior(state, behavior);
            }
          }, 250);
        }
        return;
      }

      if (this.isSitting) {
        this.isSitting = false;
        this.updateSprite(state);
      }
      //Ready to walk!
      this.movingProgressRemaining = 16;

      //Add next position
      const intentPosition = utils.nextPosition(this.x, this.y, this.direction);
      this.intentPosition = [intentPosition.x, intentPosition.y];

      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      if (this.isSitting) {
        this.isSitting = false;
        this.updateSprite(state);
      }
      this.isStanding = true;
      const standTime = behavior.time !== undefined ? behavior.time : 400; // Default to 400ms
      this.standBehaviorTimeout = setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id,
        });
        this.isStanding = false;
        if (behavior.onComplete) behavior.onComplete();
      }, standTime);
    }

    if (behavior.type === "sit") {
      this.isSitting = true;
      this.direction = behavior.direction;
      this.updateSprite(state);
      // Sit for a fixed time only if behavior.time is provided
      if (behavior.time) {
        this.sitBehaviorTimeout = setTimeout(() => {
          utils.emitEvent("PersonSitComplete", {
            whoId: this.id,
          });
          this.isSitting = false;
          this.updateSprite(state);
        }, behavior.time);
      }
    }

    if (behavior.type === "pickUpItem") {
      this.isPickingUp = true;
      this.sprite.setAnimation("pick-up-down");
      // Prevent movement while animating
      this.isStanding = true;

      // After the animation duration, emit a complete event
      setTimeout(() => {
        utils.emitEvent("PersonPickUpComplete", {
          whoId: this.id,
        });
        this.sprite.setAnimation("idle-down");
      }, behavior.time || 500);
      return;
    }
  }

  updatePosition() {
    const [property, change] = this.directionUpdate[this.direction];
    this[property] += change;
    this.movingProgressRemaining -= 1;

    if (this.movingProgressRemaining === 0) {
      this.intentPosition = null;
      //We finished the walk!
      utils.emitEvent("PersonWalkingComplete", {
        whoId: this.id,
      });
    }
  }

  playFailAnimation(onComplete) {
    this.lockedAnimation = "fail";
    this.sprite.setAnimation("fail");
    this.sprite.currentAnimationFrame = 0;

    // Calculate how long the fail animation takes to play once
    const frames = this.sprite.animations["fail"].length;
    const frameDuration = this.sprite.animationFrameLimit * (1000 / 60); // assuming 60fps

    // Play frames 0, 1, 2 in order
    let frame = 0;
    const playFrames = () => {
      if (frame < frames - 1) {
        this.sprite.currentAnimationFrame = frame;
        frame++;
        setTimeout(playFrames, frameDuration);
      } else {
        // Hold on the last frame for 3 seconds
        this.sprite.freezeAnimation = true;
        this.sprite.currentAnimationFrame = frames - 1;
        setTimeout(() => {
          this.sprite.freezeAnimation = false;
          this.lockedAnimation = null;
          if (onComplete) onComplete();
        }, 3000);
      }
    };

    playFrames();
  }

  unlockAnimation() {
    this.lockedAnimation = null;
    this.sprite.setAnimation("idle-" + this.direction);
    this.sprite.currentAnimationFrame = 0;
    this.sprite.animationFrameProgress = this.sprite.animationFrameLimit;
    console.log("character unlocked:", this.lockedAnimation);
  }

  updateSprite() {
    if (this.lockedAnimation) {
      this.sprite.setAnimation(this.lockedAnimation);
      return;
    }
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    } else if (this.isSitting) {
      this.sprite.setAnimation("sit-" + this.direction);
      return;
    } else if (this.isChopping) {
      this.sprite.setAnimation("chop-right");
      return;
    } else {
      this.sprite.setAnimation("idle-" + this.direction);
    }
  }
}
window.Person = Person;
window.GameObjectClasses = window.GameObjectClasses || {};
window.GameObjectClasses.Person = Person;
