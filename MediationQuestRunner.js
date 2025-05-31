class MediationQuestRunner {
  constructor({ quest, overworld }) {
    this.quest = quest;
    this.overworld = overworld;
    this.map = overworld.map;
    this.currentLeg = 0;
    this.currentStep = 0;
    this.timer = null;
    this.questArrow = null;
    this.isActive = false;
    this.onComplete = quest.onComplete || (() => {});
    this.onFail = quest.onFail || (() => {});
    this.handleMapChange = this.handleMapChange.bind(this);
    document.addEventListener("MapChanged", this.handleMapChange);
  }

  handleMapChange(e) {
    // Always use the current map from the overworld
    this.map = this.overworld.map;
    // Recreate the quest arrow for the new map
    this.questArrow = new QuestArrow({ map: this.map });
    // Optionally, re-show the arrow for the current step if needed
    const leg = this.quest.legs[this.currentLeg];
    const step = leg?.steps[this.currentStep];
    if (step && step.arrowTarget) {
      this.questArrow.setTarget(step.arrowTarget);
    }
  }

  destroy() {
    document.removeEventListener("MapChanged", this.handleMapChange);
  }

  start() {
    this.isActive = true;
    this.gotoLeg(0);
  }

  gotoLeg(legIndex) {
    this.currentLeg = legIndex;
    this.currentStep = 0;
    const leg = this.quest.legs[legIndex];
    if (!leg) {
      this.complete();
      return;
    }
    // Start timer for this leg
    this.startLegTimer(leg.timer);
    this.gotoStep(0);
  }

  async showDialogueSequence(dialogues) {
    for (const d of dialogues) {
      await new Promise((resolve) => {
        new TextMessage({
          text: d.text,
          name: d.name,
          autoClose: true,
          autoCloseDelay: 4000,
          blocking: true,
          onComplete: resolve,
        }).init();
      });
    }
  }

  async gotoStep(stepIndex) {
    const leg = this.quest.legs[this.currentLeg];
    const step = leg.steps[stepIndex];
    if (!step) {
      // Finished this leg, go to next leg
      this.clearLegTimer();
      if (this.currentLeg + 1 < this.quest.legs.length) {
        this.gotoLeg(this.currentLeg + 1);
      } else {
        this.complete();
      }
      return;
    }

    // Wait for map change if needed
    const requiredMap = step.arrowTarget?.map || step.requiredMap;
    if (requiredMap && this.map.id !== requiredMap) {
      const onMapChange = (e) => {
        if (e.detail.mapId === requiredMap) {
          document.removeEventListener("MapChanged", onMapChange);
          this.gotoStep(stepIndex); // Retry this step now that we're on the right map
        }
      };
      document.addEventListener("MapChanged", onMapChange);
      return;
    }

    this.currentStep = stepIndex;

    // --- DESPAWN NPCs from previous step if needed ---
    if (this.lastDespawnNPCs) {
      this.lastDespawnNPCs.forEach((npcId) => {
        const npc = this.map.gameObjects[npcId];
        if (npc && typeof npc.unmount === "function") {
          npc.unmount();
          delete this.map.gameObjects[npcId];
        }
      });
      this.lastDespawnNPCs = null;
    }
    if (step.despawnNPCs) {
      step.despawnNPCs.forEach((npcId) => {
        const npc = this.map.gameObjects[npcId];
        if (npc && typeof npc.unmount === "function") {
          npc.unmount();
          delete this.map.gameObjects[npcId];
        }
      });
      // Remember which were despawned this step (optional, for cleanup)
      this.lastDespawnNPCs = step.despawnNPCs;
    }

    // --- SPAWN NPCs for this step if needed ---
    if (step.spawnNPCs) {
      step.spawnNPCs.forEach((npcConfig) => {
        if (!this.map.gameObjects[npcConfig.id]) {
          this.overworld.addGameObject({ ...npcConfig });
        }
      });
    }

    // Teleport or move NPCs
    this.teleportNPCs(step.npcPositions);

    // Play music if needed
    if (step.music) {
      this.map.handleMusicEvent({ src: step.music, loop: true });
    }

    // Set quest arrow
    if (!this.questArrow) {
      this.questArrow = new QuestArrow({ map: this.map });
    }
    if (step.arrowTarget) {
      this.questArrow.setTarget(step.arrowTarget);
    } else {
      this.questArrow.hide();
    }
    // this.questArrow.setTarget(step.arrowTarget);
    // console.log("Step arrow target:", step.arrowTarget);

    this.targetHighlightActive = true;
    this.currentTarget = step.location;

    // Start timer
    // this.startStepTimer(step.timer);

    if (step.dialogue && step.dialogue.length) {
      await this.showDialogueSequence(step.dialogue);
    }
    console.log("Waiting for player at", step.location);
    // Listen for player reaching location
    this.waitForPlayerAt(step.location, () => {
      this.clearStepTimer();
      this.targetHighlightActive = false;
      this.questArrow.hide();

      if (step.choices && step.choices.length) {
        new MultiChoicePrompt({
          text: "What should Jiejie say?",
          choices: step.choices.map((c) => c.text),
          onComplete: (selectedIndex) => {
            const choice = step.choices[selectedIndex];
            let chain = Promise.resolve();
            choice.responses.forEach((d) => {
              chain = chain.then(() => {
                return new Promise((resolve) => {
                  new TextMessage({
                    text: d.text,
                    name: d.name,
                    autoClose: true,
                    autoCloseDelay: 2200,
                    blocking: false,
                    onComplete: resolve,
                  }).init();
                });
              });
            });
            chain.then(() => {
              if (stepIndex + 1 < leg.steps.length) {
                this.gotoStep(stepIndex + 1);
              } else {
                this.clearLegTimer();
                if (this.currentLeg + 1 < this.quest.legs.length) {
                  this.gotoLeg(this.currentLeg + 1);
                } else {
                  this.complete();
                }
              }
            });
          },
        }).init();
      } else {
        // Only call gotoStep if there are no choices
        if (stepIndex + 1 < leg.steps.length) {
          this.gotoStep(stepIndex + 1);
        } else {
          this.clearLegTimer();
          if (this.currentLeg + 1 < this.quest.legs.length) {
            this.gotoLeg(this.currentLeg + 1);
          } else {
            this.complete();
          }
        }
      }
    });
  }

  startLegTimer(seconds) {
    this.clearLegTimer();
    if (!seconds) return;
    this.timer = setTimeout(() => {
      this.fail();
    }, seconds * 1000);
    // Optionally, show a visual timer
    if (this.overworld.questTimer) {
      this.overworld.questTimer.start(this.quest.id, seconds * 1000);
    }
  }

  clearLegTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.overworld.questTimer) {
      this.overworld.questTimer.stop();
    }
  }

  teleportNPCs(npcPositions) {
    if (!npcPositions) return;
    Object.entries(npcPositions).forEach(([npcId, pos]) => {
      const npc = this.map.gameObjects[npcId];
      if (npc) {
        npc.x = pos.x;
        npc.y = pos.y;
        if (pos.direction) npc.direction = pos.direction;
      }
    });
  }

  startStepTimer(seconds) {
    this.clearStepTimer();
    if (!seconds) return;
    this.timer = setTimeout(() => {
      this.fail();
    }, seconds * 1000);
    // Optionally, show a visual timer using your QuestTimer class
    if (this.overworld.questTimer) {
      this.overworld.questTimer.start(this.quest.id, seconds * 1000);
    }
  }

  clearStepTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.overworld.questTimer) {
      this.overworld.questTimer.stop();
    }
  }

  waitForPlayerAt(target, onArrive) {
    // Listen for hero movement and check position
    const check = () => {
      if (!this.isActive) return;
      const hero = this.map.gameObjects.hero;
      if (hero && hero.x === target.x && hero.y === target.y) {
        document.removeEventListener("PersonWalkingComplete", handler);
        onArrive();
      }
    };
    const handler = (e) => {
      if (e.detail.whoId === "hero") {
        check();
      }
    };
    document.addEventListener("PersonWalkingComplete", handler);
    // Also check immediately in case already at location
    check();
  }

  fail() {
    this.isActive = false;
    this.clearStepTimer();
    if (this.questArrow) this.questArrow.hide();
    if (typeof this.onFail === "function") {
      this.onFail(this.overworld);
    }
  }

  complete() {
    this.isActive = false;
    this.clearStepTimer();
    if (this.questArrow) this.questArrow.hide();
    if (typeof this.onComplete === "function") {
      this.onComplete(this.overworld);
    }
  }
}

window.MediationQuestRunner = MediationQuestRunner;
