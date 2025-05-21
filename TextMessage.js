class TextMessage {
  constructor({ text, onComplete }) {
    this.text = text;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    //Create the element
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");

    this.element.innerHTML = `
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
    this.element.remove();
    this.actionListener?.unbind();
    if (this.onComplete) this.onComplete();
  }

  init(container) {
    if (!container) {
      container = document.querySelector(".game-container");
    }
    if (!container) {
      throw new Error("No .game-container found in the DOM for TextMessage!");
    }
    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();
  }
}
