class EndGameMessage {
  constructor({ onComplete, overworld }) {
    this.onComplete = onComplete;
    this.overworld = overworld;
    this.element = null;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("WelcomeMessage");
    this.element.innerHTML = `
      <div class="WelcomeMessage_p">
        <h2>Thank you for playing<br/>The Parts We Give, the Game.</h2>
        <p>
          We hope you enjoyed getting to know the world, the characters, and the music.<br/><br/>
          As thanks, please enjoy this discount ticket to the opera.
        </p>
        <div class="EndGameMessage_ticket">
          <img src="./images/opera_ticket.png" alt="Opera Discount Ticket" style="max-width:200px;"/>
          <br/>
          <button class="EndGameMessage_print">Print Ticket</button>
        </div>
        <br/>
        <button class="EndGameMessage_return">Return to Title Screen</button>
      </div>
    `;

    // Print button
    this.element
      .querySelector(".EndGameMessage_print")
      .addEventListener("click", () => {
        window.print();
      });

    // Return to title screen button
    this.element
      .querySelector(".EndGameMessage_return")
      .addEventListener("click", () => {
        this.done();
      });
  }

  done() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this.overworld) {
      this.overworld.showTitleScreen();
    }
    if (this.onComplete) this.onComplete();
  }

  init(container = document.querySelector(".game-container")) {
    this.createElement();
    container.appendChild(this.element);
  }
}

window.EndGameMessage = EndGameMessage;
