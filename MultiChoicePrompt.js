class MultiChoicePrompt {
  constructor({ text, choices, onComplete, map }) {
    this.text = text;
    this.choices = choices; // Array of strings
    this.onComplete = onComplete;
    this.selectedIndex = 0;
    this.element = null;
    this.optionElements = [];
    this.listeners = [];
    this.map = map;
  }

  createElement() {
    const container = document.createElement("div");
    container.classList.add("YesNoPrompt"); // Use same base class for styling

    // Prompt text (optional, can be omitted if you want only choices)
    if (this.text) {
      const prompt = document.createElement("div");
      prompt.classList.add("YesNoPrompt-text");
      prompt.textContent = this.text;
      container.appendChild(prompt);
    }

    // Option list
    const ul = document.createElement("ul");
    ul.classList.add("YesNoPrompt-options");

    this.choices.forEach((choice, idx) => {
      const li = document.createElement("li");
      li.textContent = choice;
      if (idx === this.selectedIndex) li.classList.add("selected");
      ul.appendChild(li);
      this.optionElements.push(li);
    });

    container.appendChild(ul);
    this.element = container;
  }

  updateSelection() {
    this.optionElements.forEach((el, idx) => {
      el.classList.toggle("selected", idx === this.selectedIndex);
    });
  }

  bindKeys() {
    // Up/Down or W/S toggles selection
    this.listeners.push(
      new KeyPressListener("ArrowUp", () => {
        this.selectedIndex =
          (this.selectedIndex + this.choices.length - 1) % this.choices.length;
        this.updateSelection();
      })
    );
    this.listeners.push(
      new KeyPressListener("ArrowDown", () => {
        this.selectedIndex = (this.selectedIndex + 1) % this.choices.length;
        this.updateSelection();
      })
    );
    this.listeners.push(
      new KeyPressListener("KeyW", () => {
        this.selectedIndex =
          (this.selectedIndex + this.choices.length - 1) % this.choices.length;
        this.updateSelection();
      })
    );
    this.listeners.push(
      new KeyPressListener("KeyS", () => {
        this.selectedIndex = (this.selectedIndex + 1) % this.choices.length;
        this.updateSelection();
      })
    );
    // Enter selects
    this.listeners.push(
      new KeyPressListener("Enter", () => {
        this.close();
        if (this.onComplete) this.onComplete(this.selectedIndex);
      })
    );
  }

  unbindKeys() {
    this.listeners.forEach((listener) => listener.unbind());
    this.listeners = [];
  }

  init(container = document.querySelector(".game-container")) {
    if (window.overworld && window.overworld.directionInput) {
      window.overworld.directionInput.enabled = false;
    }
    this.createElement();
    container.appendChild(this.element);
    this.bindKeys();
    // Position above and to the left of the text box, like YesNoPrompt
    const textBox = container.querySelector(".TextMessage");
    if (textBox) {
      const boxRect = textBox.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      this.element.style.position = "absolute";
      this.element.style.left = boxRect.left - containerRect.left + 10 + "px";
      this.element.style.top =
        boxRect.top - containerRect.top - this.element.offsetHeight - 8 + "px";
    }
  }

  close() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.unbindKeys();
    if (window.overworld && window.overworld.directionInput) {
      window.overworld.directionInput.enabled = true;
      window.overworld.directionInput.heldDirections = [];
    }

    if (this.onClose) this.onClose();
  }
}

window.MultiChoicePrompt = MultiChoicePrompt;
