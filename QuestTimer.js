class QuestTimer {
  constructor() {
    this.questId = null;
    this.interval = null;
    this.element = null;
    this.createElement();
    document.querySelector(".game-container").appendChild(this.element);
    this.isPaused = false;
    this.pauseStartedAt = null;
    this.startTime = null;
    this.elapsedBeforePause = 0;
    this.duration = 0;
  }

  start(questId, duration, milestones = []) {
    this.questId = questId;
    this.duration = duration;
    this.startTime = Date.now();
    this.elapsedBeforePause = 0;
    this.isPaused = false;
    this.pauseStartedAt = null;
    this.milestones = milestones.map((m) => ({ ...m, triggered: false }));

    this.element.style.display = "block";

    this.interval = setInterval(() => {
      if (this.isPaused) return; // Skip update if paused

      const elapsed = Date.now() - this.startTime + this.elapsedBeforePause;
      const remaining = Math.max(0, this.duration - elapsed);
      const seconds = Math.ceil(remaining / 1000);
      this.element.textContent = `Time left: ${seconds}s`;

      // Check milestones
      this.milestones.forEach((milestone) => {
        if (!milestone.triggered && remaining <= milestone.at) {
          milestone.triggered = true;
          // Show the TextMessage
          new TextMessage({
            text: milestone.text,
            name: milestone.who || milestone.name,
            autoClose: true,
            autoCloseDelay: 3000,
          }).init();
        }
      });

      if (remaining <= 0) {
        this.stop();
      }
    }, 250);
  }

  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseStartedAt = Date.now();
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.pauseStartedAt) {
        this.elapsedBeforePause += Date.now() - this.pauseStartedAt;
        this.pauseStartedAt = null;
      }
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
