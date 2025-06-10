class ChopFruitRoom {
  constructor({ quest, onComplete }) {
    this.quest = quest;
    this.onComplete = onComplete;
    this.phase = 0;
    this.dialogueIndex = 0;
    this.container = null;
    this.knife = new Knife({ src: quest.knifeSrc });
    this.apple = new Apple({ src: quest.appleSrc, phase: 0 });
    this.isChopping = false;

    // Add background image
    this.backgroundImage = new Image();
    this.backgroundLoaded = false;
    this.backgroundImage.onload = () => {
      this.backgroundLoaded = true;
    };
    this.backgroundImage.src = quest.background;
    this.isEnterHeld = false;
    this.appleBits = [];
    this.platePositions = [
      { x: 73, y: -5 },
      { x: 147, y: -15 },
      { x: 221, y: -5 },
      { x: 289, y: 52 },
      // ...add as many as needed
    ];
    this.waitingForKnifeRelease = false;
    this.appleVisible = true;
  }

  createElement() {
    this.container = document.createElement("div");
    this.container.classList.add("ChopFruitRoom");
    this.container.style.background = `url(${this.quest.background})`;
    this.container.style.backgroundSize = "cover";
    this.container.innerHTML = `
      <canvas class="chop-canvas" width="352" height="198"></canvas>
    `;
  }

  showDialogue({ text, name }, onComplete) {
    new TextMessage({
      text,
      name,
      onComplete,
    }).init(this.container);
  }

  draw() {
    const canvas = this.container.querySelector(".chop-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background first
    if (this.backgroundLoaded) {
      ctx.drawImage(this.backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    if (this.appleVisible) {
      this.apple.draw(ctx);
    }
    this.knife.draw(ctx);
    this.appleBits.forEach((bit) => {
      bit.update(performance.now());
      bit.draw(ctx, this.apple.image);
    });
  }

  async start(container) {
    this.createElement();
    container.appendChild(this.container);
    this.draw();
    new TextMessage({
      text: "* Press enter to begin chopping fruit for Didi's Fruito *",
    }).init(this.container);

    this.state = "waitingForFirstEnter";

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    this.loop = () => {
      this.draw();
      if (!this.finished) requestAnimationFrame(this.loop);
    };
    this.loop();
  }

  handleKeyDown = (e) => {
    if (e.code === "Enter") {
      this.isEnterHeld = true;
    }

    // ...existing logic...
    if (e.code !== "Enter") return;

    if (this.state === "waitingForFirstEnter") {
      this.state = "showingDialogue";
      this.showDialogue(this.quest.dialogue[this.dialogueIndex], () => {
        this.state = "waitingForChop";
      });
      return;
    }

    if (this.state === "waitingForChop") {
      this.state = "chopping";
      this.knife.animateChop(
        () => {
          // This runs after the knife animation and Enter is released
          if (this.phase < this.quest.applePhases.length) {
            this.dialogueIndex++;
            this.state = "showingDialogue";
            const isLastDialogue =
              this.dialogueIndex === this.quest.dialogue.length - 1;
            this.showDialogue(this.quest.dialogue[this.dialogueIndex], () => {
              this.state = isLastDialogue
                ? "waitingForFinish"
                : "waitingForChop";
            });
          } else {
            this.finish();
          }
          this.waitingForKnifeRelease = false;
        },
        () => this.isEnterHeld, // Enter held check
        () => {
          // This runs exactly when knife enters frame 3
          this.phase++;
          this.apple.setPhase(this.phase);
          this.waitingForKnifeRelease = true;
          const plateIndex = this.phase; // or wherever you are in the sequence
          const dest = this.platePositions[plateIndex - 1];
          if (dest) {
            this.appleBits.push(
              new AppleBit({
                startX: 146,
                startY: 71, // where the apple is chopped
                endX: dest.x,
                endY: dest.y,
                frame: this.phase, // next apple frame
              })
            );
          }
          if (this.phase === 4) {
            this.appleVisible = false;
          }
        }
      );
    }

    if (this.state === "waitingForFinish") {
      this.finish();
      return;
    }
  };

  handleKeyUp = (e) => {
    if (e.code === "Enter") {
      this.isEnterHeld = false;
      if (this.state === "chopping" && this.waitingForKnifeRelease) {
        this.waitingForKnifeRelease = false; // Reset the flag
      }
    }
  };

  finish() {
    this.finished = true;
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    if (this.onComplete) this.onComplete(this);
  }

  cleanup() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
