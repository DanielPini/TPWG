class YesNoPrompt {
  constructor({ text, onComplete }) {
    this.text = text;
    this.onComplete = onComplete;
    this.options = ["Yes", "No"];
    this.selectedIndex = 0;
    this.element = null;
    this.optionElements = [];
    this.listeners = [];
  }

  createElement() {
    const container = document.createElement("div");
    container.classList.add("YesNoPrompt");

    // Option list
    const ul = document.createElement("ul");
    ul.classList.add("YesNoPrompt-options");

    this.options.forEach((option, idx) => {
      const li = document.createElement("li");
      li.textContent = option;
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
          (this.selectedIndex + this.options.length - 1) % this.options.length;
        this.updateSelection();
      })
    );
    this.listeners.push(
      new KeyPressListener("ArrowDown", () => {
        this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
        this.updateSelection();
      })
    );
    this.listeners.push(
      new KeyPressListener("KeyW", () => {
        this.selectedIndex =
          (this.selectedIndex + this.options.length - 1) % this.options.length;
        this.updateSelection();
      })
    );
    this.listeners.push(
      new KeyPressListener("KeyS", () => {
        this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
        this.updateSelection();
      })
    );
    // Enter selects
    this.listeners.push(
      new KeyPressListener("Enter", () => {
        this.close();
        this.onComplete(this.selectedIndex === 0); // true for Yes, false for No
      })
    );
  }

  unbindKeys() {
    this.listeners.forEach((listener) => listener.unbind());
    this.listeners = [];
  }

  init(container = document.querySelector(".game-container")) {
    this.createElement();
    container.appendChild(this.element);
    this.bindKeys();
    const questTimer = window.overworld?.questTimer;
    if (questTimer && typeof questTimer.pause === "function") {
      questTimer.pause();
    }
    // Position above and to the left of the text box
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
    const questTimer = window.overworld?.questTimer;
    if (questTimer && typeof questTimer.resume === "function") {
      questTimer.resume();
    }
    this.unbindKeys();
  }
}

window.YesNoPrompt = YesNoPrompt;
