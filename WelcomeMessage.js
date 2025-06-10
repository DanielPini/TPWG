class WelcomeMessage {
  constructor({ onComplete, map }) {
    this.onComplete = onComplete;
    this.map = map;
    this.element = null;
    this.actionListener = null;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("WelcomeMessage");
    this.element.innerHTML = `
      <div class="WelcomeMessage_p">
        <h2>
          Welcome to <br />The Parts We Give <br />
          The Game
        </h2>
        <br /><br />
        <p>
          Use <b>Arrow Keys</b> to move.<br />
          Press <b>Enter</b> to interact.<br />
          Press <b>Escape</b> to pause and open the menu.<br /><br />
          <i>Explore, help your family, and enjoy the story!</i>
        </p>
        <button class="WelcomeMessage_button">Start</button>
      </div>
    `;

    this.element
      .querySelector(".WelcomeMessage_button")
      .addEventListener("click", () => {
        this.done();
      });

    this.actionListener = new KeyPressListener("Enter", () => {
      this.done();
    });
  }

  done() {
    if (this.actionListener) {
      this.actionListener.unbind();
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this.map) this.map.isPaused = false;
    if (this.onComplete) this.onComplete();
  }

  init(container) {
    if (!container) {
      container = document.querySelector(".game-container");
    }
    if (!container) {
      throw new Error(
        "No .game-container found in the DOM for WelcomeMessage!"
      );
    }
    if (this.map) this.map.isPaused = true; // Pause the map
    this.createElement();
    container.appendChild(this.element);
  }
}
window.WelcomeMessage = WelcomeMessage;
