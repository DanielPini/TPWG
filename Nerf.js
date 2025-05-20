class Nerf extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: "./images/Nerf.png",
      animations: {
        idle: [[config.frame || 0, 0]], // Use config.frame for different Nerfs
      },
      currentAnimation: "idle",
    });
    this.storyFlag = config.storyFlag;

    this.talking = [
      {
        required: [this.storyFlag],
        events: [
          {
            type: "textMessage",
            text: "You already picked up this Nerf bullet.",
          },
        ],
      },
      {
        events: [
          {
            type: "textMessage",
            text: "You found a stray Nerf bullet!",
          },
          {
            type: "takeItem",
            item: this,
            itemName: "NERF BULLET",
          },
          {
            type: "pickUpItem",
            who: "hero",
            time: 500,
          },
        ],
      },
    ];
  }

  destroy() {
    if (this.map && this.id) {
      delete this.map.gameObjects[this.id];
    }
    if (this.sprite?.remove) {
      this.sprite.remove();
    }
  }

  update() {
    // You can add animation or state logic here if needed
    this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? "used-down"
      : "idle";
  }
}

window.GameObjectClasses = window.GameObjectClasses || {};
window.GameObjectClasses["Nerf"] = Nerf;
