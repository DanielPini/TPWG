class Plates extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: "./images/objects/Plates.png",
      animations: {
        placed: [[0, 1]],
      },
      currentAnimation: "placed",
    });
    this.storyFlag = config.storyFlag;

    this.talking = [
      {
        required: [this.storyFlag],
        events: [{ type: "textMessage", text: "You have already used this." }],
      },
      {
        events: [
          {
            type: "textMessage",
            text: "These are the plates for the table",
          },
          {
            type: "takeItem",
            item: this,
            itemName: "PLATES",
          },
          {
            type: "pickUpItem",
            who: "hero",
            itemId: this.id,
            itemType: this.type,
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
    this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? "used-down"
      : "placed";
  }
}
