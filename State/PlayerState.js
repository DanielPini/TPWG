class PlayerState {
  constructor() {
    this.character = "brother";
    this.pizzas = {
      p1: {
        pizzaId: "s001",
        hp: 50,
        maxHp: 50,
        xp: 0,
        maxXp: 100,
        level: 1,
        status: null,
      },
    };
    this.lineup = ["p1"];
    this.items = [
      { actionId: "item_recoverHp", instanceId: "item1" },
      { actionId: "item_recoverHp", instanceId: "item2" },
      { actionId: "item_recoverHp", instanceId: "item3" },
    ];
    this.inventory = [];
    this.storyFlags = {
      SEEN_INTRO: false,
    };
    this.sisterUnlocked = true;
  }

  addPizza(pizzaId) {
    const newId = `p${Date.now()}` + Math.floor(Math.random() * 99999);
    this.pizzas[newId] = {
      pizzaId,
      hp: 50,
      maxHp: 50,
      xp: 0,
      maxXp: 100,
      level: 1,
      status: null,
    };
    if (this.lineup.length < 3) {
      this.lineup.push(newId);
    }
    utils.emitEvent("LineupChanged");
  }

  swapLineup(oldId, incomingId) {
    const oldIndex = this.lineup.indexOf(oldId);
    this.lineup[oldIndex] = incomingId;
    utils.emitEvent("LineupChanged");
  }

  changeCharacter() {
    if (!this.sisterUnlocked) return;
    this.character == "brother"
      ? (this.character = "sister")
      : (this.character = "brother");
  }

  moveToFront(futureFrontId) {
    this.lineup = this.lineup.filter((id) => id !== futureFrontId);
    this.lineup.unshift(futureFrontId);
    utils.emitEvent("LineupChanged");
  }
}
window.playerState = new PlayerState();
