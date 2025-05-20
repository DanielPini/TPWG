class QuestTimer {
  constructor() {
    this.questId = null;
    this.interval = null;
    this.element = null;
    this.createElement();
    document.querySelector(".game-container").appendChild(this.element);
  }

  start(questId, duration) {
    this.questId = questId;
    const start = Date.now();

    this.element.style.display = "block";

    this.interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, duration - elapsed);
      const seconds = Math.ceil(remaining / 1000);
      this.element.textContent = `Time left: ${seconds}s`;

      if (remaining <= 0) {
        this.stop();
      }
    }, 250);
  }

  stop() {
    clearInterval(this.interval);
    this.element.style.display = "none";
    this.questId = null;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("QuestTimer");
    this.element.id = "QuestTimer";

    this.element.style =
      "display: none; position: absolute; top: 16px; right: 16px; background: black; color: white; padding: 4px 8px; border-radius: 4px;";
  }
}
