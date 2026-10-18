class PlayerState {
  constructor() {
    this.character = "brother";
    this.inventory = [];
    this.storyFlags = {
      SEEN_INTRO: false,
    };
    this.sisterUnlocked = true;
  }

  changeCharacter() {
    if (!this.sisterUnlocked) return;
    this.character == "brother"
      ? (this.character = "sister")
      : (this.character = "brother");
  }
}
window.playerState = new PlayerState();
