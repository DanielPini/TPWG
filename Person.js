class Person extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.isSitting = false;
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

    //Set character direction to whatever behavior has
    if (behavior.type !== "sit") {
      this.direction = behavior.direction;
    }

    if (behavior.type === "walk") {
      //Stop here if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
        behavior.retry &&
          setTimeout(() => {
            this.startBehavior(state, behavior);
          }, 10);
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
      this.standBehaviorTimeout = setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id,
        });
        this.isStanding = false;
      }, behavior.time);
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

  updateSprite() {
    // this.direction = this.previousDirection ? this.previousDirection : "down";
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    } else if (this.isSitting) {
      this.sprite.setAnimation("sit-" + this.direction);
      return;
    } else this.sprite.setAnimation("idle-" + this.direction);
  }
}
