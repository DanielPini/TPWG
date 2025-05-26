class NerfPile extends GameObject {
  constructor(config) {
    super(config);
    this.scale = 0.7;
    this.translateSprite = [5, 10];
    this.sprite = new Sprite({
      gameObject: this,
      src: "./images/objects/Nerf.png",
      animations: {
        "idle-down": [[4, 0]], // 5th crop (pile)
      },
      currentAnimation: "idle-down", // <-- Add this line!
      frameLimit: 1,
      frameWidth: 32,
      frameHeight: 32,
      useShadow: false,
    });
    this.isPickUp = true;
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
            text: "You found a pile of Nerf bullets!",
          },
          {
            type: "takeItem",
            item: this,
            itemName: "NERF BULLETS",
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
    // You can add animation or state logic here if needed
    this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? "used-down"
      : "idle-down";
  }
}
window.GameObjectClasses["NerfPile"] = NerfPile;
