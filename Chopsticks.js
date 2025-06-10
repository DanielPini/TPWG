class Chopsticks extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: "./images/objects/Chopsticks.png",
      animations: {
        placed: [[0, 1]],
      },
      currentAnimation: "placed",
      useShadow: false,
    });
    this.storyFlag = config.storyFlag;
    this.translateSprite = [0, -4];

    this.talking = [
      {
        required: [this.storyFlag],
        events: [{ type: "textMessage", text: "You have already used this." }],
      },
      {
        events: [
          {
            type: "takeItem",
            item: this,
            itemName: "CHOPSTICKS",
          },
          {
            type: "pickUpItem",
            who: "hero",
            itemId: this.id,
            itemType: this.type,
            time: 700,
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
    this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? "used-down"
      : "placed";
  }
}
window.GameObjectClasses = window.GameObjectClasses || {};
window.GameObjectClasses["Chopsticks"] = Chopsticks;
