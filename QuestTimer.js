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
    this.milestoneTimeouts = [];
  }

  start(questId, duration, milestones = []) {
    this.stop();
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
      this.element.style.padding =
        this.element.textContent === "" ? "" : "4px 8px";
      this.element.style.border =
        this.element.textContent === ""
          ? ""
          : "1px solid var(--menu-border-color)";
      console.log(this.element.style.padding);

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

  refresh() {
    // Re-append the timer element to the DOM if needed
    const container = document.querySelector(".game-container");
    if (this.element && container && !container.contains(this.element)) {
      container.appendChild(this.element);
    }
    // Force update the display
    if (this.startTime && this.duration) {
      const elapsed = Date.now() - this.startTime + this.elapsedBeforePause;
      const remaining = Math.max(0, this.duration - elapsed);
      const seconds = Math.ceil(remaining / 1000);
      this.element.textContent = `Time left: ${seconds}s`;
      this.element.style.display = "block";
    }
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
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    // Clear any milestone timeouts if you ever add them
    if (this.milestoneTimeouts) {
      this.milestoneTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      this.milestoneTimeouts = [];
    }
    this.element.style.display = "none";
    this.questId = null;
    this.startTime = null;
    this.elapsedBeforePause = 0;
    this.duration = 0;
    this.milestones = [];
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("QuestTimer");
    this.element.id = "QuestTimer";
    this.element.style = "display: none; ";
  }
}
