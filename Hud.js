class Hud {
  constructor() {
    this.element = null;
  }

  update() {
    if (!this.element) return;
    const { inventory } = window.playerState;
    const platesCount = inventory.filter((item) => item === "plate").length;
    const chopsticksCount = inventory.filter(
      (item) => item === "chopstick"
    ).length;
    const nerfsCount = inventory.filter((item) => item === "nerf").length;
    this.platesDiv.innerHTML =
      platesCount > 0
        ? `<p class="plates-text">Plates: ${platesCount} / 8 </p>`
        : "";
    this.chopsticksDiv.innerHTML =
      chopsticksCount > 0
        ? `<p class="chopsticks-text">chopsticks: ${chopsticksCount} / 8 </p>`
        : "";
    this.nerfsDiv.innerHTML =
      nerfsCount > 0
        ? `<p class="nerfs-text">Nerfs: ${nerfsCount} / 25 </p>`
        : "";
    if (platesCount > 0 || nerfsCount > 0 || chopsticksCount > 0) {
      this.element.style.display = "block";
      this.element.style.border = "1px solid var(--menu-border-color);";
    } else {
      this.element.style.display = "none";
    }
  }

  createElement() {
    if (this.element) {
      this.element.remove();
    }

    this.element = document.createElement("div");
    this.element.classList.add("Hud");

    // Count Plates and Nerfs
    const { inventory } = window.playerState;
    const platesCount = inventory.filter((item) => item === "plate").length;
    const chopsticksCount = inventory.filter(
      (item) => item === "chopstick"
    ).length;
    const nerfsCount = inventory.filter((item) => item === "nerf").length;

    this.platesDiv = document.createElement("div");
    this.platesDiv.className = "Hud-plates";
    this.platesDiv.innerHTML =
      platesCount > 0
        ? `<p class="plates-text">Plates: ${platesCount} / 8 </p>`
        : "";
    this.element.append(this.platesDiv);

    this.chopsticksDiv = document.createElement("div");
    this.chopsticksDiv.className = "Hud-chopsticks";
    this.chopsticksDiv.innerHTML =
      chopsticksCount > 0
        ? `<p class="chopsticks-text">Chopsticks: ${chopsticksCount} / 8 </p>`
        : "";
    this.element.append(this.chopsticksDiv);

    this.nerfsDiv = document.createElement("div");
    this.nerfsDiv.className = "Hud-nerfs";
    this.nerfsDiv.innerHTML =
      nerfsCount > 0
        ? `<p class="nerfs-text">Nerfs: ${nerfsCount} / 25 </p>`
        : "";
    this.element.append(this.nerfsDiv);

    if (platesCount > 0 || nerfsCount > 0 || chopsticksCount > 0) {
      this.element.style.display = "block";
      this.element.style.border = "1px solid var(--menu-border-color);";
    } else {
      this.element.style.display = "none";
    }
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);

    document.addEventListener("PlayerStateUpdated", () => {
      this.update();
    });
  }
}
