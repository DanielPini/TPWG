class SceneTransition {
  constructor() {
    this.element = null;
    this.midpointTimeout = null;
  }
  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("SceneTransition");
  }

  fadeOut(callback) {
    this.element.classList.add("fade-out");
    this.element.addEventListener(
      "animationend",
      () => {
        if (callback) callback();
        this.element.remove();
      },
      { once: true }
    );
  }

  init(container, onComplete, onMidpoint) {
    this.createElement();
    container.appendChild(this.element);

    // Fire midpoint callback at 600ms
    if (onMidpoint) {
      this.midpointTimeout = setTimeout(() => {
        onMidpoint();
      }, 600);
    }

    this.element.addEventListener(
      "animationend",
      () => {
        if (onComplete) onComplete();
      },
      { once: true }
    );
  }
}
