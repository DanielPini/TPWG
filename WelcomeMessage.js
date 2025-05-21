class WelcomeMessage extends TextMessage {
  constructor({ onComplete, map }) {
    super({
      text: ` <h2>
          Welcome to <br />The Parts We Give <br />
          The Game
        </h2>
        <br /><br />
        <p>
          Use <b>Arrow Keys</b> to move.<br />
          Press <b>Enter</b> to interact.<br />
          Press <b>Escape</b> to pause and open the menu.<br /><br />
          <i>Explore, help your family, and enjoy the story!</i>
        </p>`,
      onComplete: () => {
        if (map) map.isPaused = false;
        onComplete && onComplete();
      },
      className: "WelcomeMessage",
    });
    this.map = map;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("WelcomeMessage");

    this.element.innerHTML = `
      <div class="WelcomeMessage_p">${this.text}</div>
      <button class="WelcomeMessage_button">Start</button>
    `;

    this.element.querySelector("button").addEventListener("click", () => {
      this.done();
    });

    this.actionListener = new KeyPressListener("Enter", () => {
      this.done();
    });
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
