class NerfPile extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: "./images/Nerf.png",
      animations: {
        "idle-down": [[4, 0]], // 5th crop (pile)
      },
      frameLimit: 1,
      frameWidth: 32,
      frameHeight: 32,
    });
    this.isPickUp = false; // Not pickable, just visual
  }
}
window.GameObjectClasses["NerfPile"] = NerfPile;
