class TextMessage {
  constructor({
    text,
    onComplete,
    name,
    autoClose = false,
    autoCloseDelay = 2000,
  }) {
    this.text = text;
    this.onComplete = onComplete;
    this.element = null;
    this.name = name || null;
    this.autoClose = autoClose;
    this.autoCloseDelay = autoCloseDelay;
    this.autoCloseTimeout = null;
  }

  createElement() {
    //Create the element
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");

    this.element.innerHTML = `
      ${
        this.name ? `<div class="TextMessage_nameplate">${this.name}</div>` : ""
      }
      <p class="TextMessage_p"></p>
      <button class="TextMessage_button">Next</button>
    `;

    //Init the typewriter effect
    this.revealingText = new RevealingText({
      element: this.element.querySelector(".TextMessage_p"),
      text: this.text,
    });

    this.element.querySelector("button").addEventListener("click", () => {
      //Close the text message
      this.done();
    });

    this.actionListener = new KeyPressListener("Enter", () => {
      this.done();
    });
  }

  done() {
    // Only warp to done if revealingText exists and isn't done yet
    if (this.revealingText && !this.revealingText.isDone) {
      this.revealingText.warpToDone();
      return;
    }
    const questTimer = window.overworld?.questTimer;
    if (questTimer && typeof questTimer.resume === "function") {
      questTimer.resume();
    }
    this.element.remove();
    this.actionListener?.unbind();
    if (this.autoCloseTimeout) clearTimeout(this.autoCloseTimeout);
    if (this.onComplete) this.onComplete();
  }

  init(container) {
    if (!container) {
      container = document.querySelector(".game-container");
    }
    if (!container) {
      throw new Error("No .game-container found in the DOM for TextMessage!");
    }

    const questTimer = window.overworld?.questTimer;
    if (questTimer && typeof questTimer.pause === "function") {
      questTimer.pause();
    }

    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();

    if (this.autoClose) {
      this.autoCloseTimeout = setTimeout(
        () => this.done(),
        this.autoCloseDelay
      );
    }
  }
}
