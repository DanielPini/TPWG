class QuestTimer {
  constructor() {
    this.questId = null;
    this.interval = null;
    this.element = null;
    this.createElement();
    document.querySelector(".game-container").appendChild(this.element);
    this.isPaused = false;
    this.startTime = null;
    this.elapsedBeforePause = 0;
    this.duration = 0;
  }

  start(questId, duration) {
    this.questId = questId;
    this.duration = duration;
    this.startTime = Date.now();
    this.elapsedBeforePause = 0;
    this.isPaused = false;

    this.element.style.display = "block";

    this.interval = setInterval(() => {
      if (this.isPaused) return; // Skip update if paused

      const elapsed = Date.now() - this.startTime + this.elapsedBeforePause;
      const remaining = Math.max(0, this.duration - elapsed);
      const seconds = Math.ceil(remaining / 1000);
      this.element.textContent = `Time left: ${seconds}s`;

      if (remaining <= 0) {
        this.stop();
      }
    }, 250);
  }

  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.elapsedBeforePause += Date.now() - this.startTime;
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.startTime = Date.now();
    }
  }

  stop() {
    clearInterval(this.interval);
    this.element.style.display = "none";
    this.questId = null;
    this.startTime = null;
    this.elapsedBeforePause = 0;
    this.duration = 0;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("QuestTimer");
    this.element.id = "QuestTimer";
    this.element.style = "display: none; ";
  }
}
