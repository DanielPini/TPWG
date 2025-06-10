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
    this.legTimer = null;
    this.stepTimer = null;
    document.addEventListener("MapChanged", this.handleMapChange);
  }

  startLegTimer(seconds, isResume = false) {
    this.clearLegTimer();
    if (!seconds) return;
    if (!isResume) {
      this.legStartTime = Date.now();
      this.legDuration = seconds * 1000;
    }
    this.legTimer = setTimeout(() => {
      this.fail();
    }, seconds * 1000);
    if (this.overworld.questTimer) {
      this.overworld.questTimer.start(this.quest.id, seconds * 1000);
    }
  }

  clearLegTimer() {
    if (this.legTimer) {
      clearTimeout(this.legTimer);
      this.legTimer = null;
    }
    if (this.overworld.questTimer) {
      this.overworld.questTimer.stop();
    }
  }

  startStepTimer(seconds) {
    this.clearStepTimer();
    if (!seconds) return;
    this.stepTimer = setTimeout(() => {
      this.fail();
    }, seconds * 1000);
    if (this.overworld.questTimer) {
      this.overworld.questTimer.start(this.quest.id, seconds * 1000);
    }
  }

  clearStepTimer() {
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }
    if (this.overworld.questTimer) {
      this.overworld.questTimer.stop();
    }
  }

  handleMapChange(e) {
    if (this.questArrow) {
      this.questArrow.hide();
      this.questArrow = null;
    }
    this.map = this.overworld.map;
    const leg = this.quest.legs[this.currentLeg];
    const step = leg?.steps[this.currentStep];
    if (
      step &&
      step.arrowTarget &&
      (!step.arrowTarget.map || step.arrowTarget.map === this.map.id)
    ) {
      this.questArrow = new QuestArrow({ map: this.map });
      this.questArrow.setTarget(step.arrowTarget);
    }
  }

  destroy() {
    this.clearLegTimer();
    this.clearStepTimer();
    document.removeEventListener("MapChanged", this.handleMapChange);
    // Remove any other event listeners you added
  }

  start() {
    this.isActive = true;
    // Wait for next tick to ensure hero is mounted
    setTimeout(() => {
      this.map
        .startCutscene([{ type: "sit", who: "hero", direction: "up" }])
        .then(() => {
          this.gotoLeg(0);
        });
    }, 0);
  }

  revealArrowAndLocation(step) {
    if (this.questArrow) {
      this.questArrow.hide();
      this.questArrow = null;
    }
    if (
      step.arrowTarget &&
      (!step.arrowTarget.map || step.arrowTarget.map === this.map.id)
    ) {
      this.questArrow = new QuestArrow({ map: this.map });
      this.questArrow.setTarget(step.arrowTarget);
    }
    this.targetHighlightActive = true;
    this.currentTarget = step.location;
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
      if (!d.text) continue;
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
          // Timer fix
          if (this.legStartTime && this.legDuration) {
            const elapsed = Date.now() - this.legStartTime;
            const remaining = Math.max(0, this.legDuration - elapsed);
            this.startLegTimer(remaining / 1000, true);
          }
          this.gotoStep(stepIndex);
        }
      };
      document.addEventListener("MapChanged", onMapChange);
      return;
    }

    this.currentStep = stepIndex;

    // Despawn NPCs from previous step if needed
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
      this.lastDespawnNPCs = step.despawnNPCs;
    }

    // Spawn NPCs for this step if needed
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

    // Cutscene and dialogue (run in order)
    if (step.cutscene && step.cutscene.length) {
      await this.map.startCutscene(step.cutscene);
    }
    if (step.dialogue && step.dialogue.length) {
      await this.showDialogueSequence(step.dialogue);
    }

    this.revealArrowAndLocation(step);

    // Wait for player to reach location
    this.waitForPlayerAt(step.location, async () => {
      this.clearStepTimer();
      this.targetHighlightActive = false;
      this.questArrow.hide();

      if (step.choices && step.choices.length) {
        await this.waitForChoice(step);
        // If you want to run a cutscene after choices, add:
        if (step.afterChoiceCutscene && step.afterChoiceCutscene.length) {
          await this.map.startCutscene(step.afterChoiceCutscene);
        }
      }

      // Advance to next step or leg
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

  async waitForChoice(step) {
    return new Promise((resolve) => {
      new MultiChoicePrompt({
        text: "What should Jiejie say?",
        choices: step.choices.map((c) => c.text),
        onComplete: (selectedIndex) => {
          const choice = step.choices[selectedIndex];
          let chain = Promise.resolve();
          choice.responses.forEach((d) => {
            chain = chain.then(() => {
              return new Promise((res) => {
                new TextMessage({
                  text: d.text,
                  name: d.name,
                  autoClose: true,
                  autoCloseDelay: 2200,
                  blocking: false,
                  onComplete: res,
                }).init();
              });
            });
          });
          chain.then(() => resolve());
        },
      }).init();
    });
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
        const hero = this.map.gameObjects.hero;
        if (hero && hero.x === target.x && hero.y === target.y) {
          document.removeEventListener("PersonWalkingComplete", handler);
          onArrive();
        }
      }
    };
    document.addEventListener("PersonWalkingComplete", handler);
    // Also check immediately in case already at location
    check();
  }

  // fail() {
  //   if (this.hasFailed) return;
  //   this.hasFailed = true;

  //   this.isActive = false;
  //   this.clearLegTimer();
  //   this.clearStepTimer();
  //   if (this.questArrow) this.questArrow.hide();
  //   const hero = this.map.gameObjects.hero;
  //   if (hero && typeof hero.playFailAnimation === "function") {
  //     hero.playFailAnimation();
  //     // Calculate how long the fail animation takes to play once
  //     const frames = hero.sprite.animations["fail"].length;
  //     const frameDuration = hero.sprite.animationFrameLimit * (1000 / 60); // assuming 60fps
  //     const totalDuration = frames * frameDuration;

  //     setTimeout(() => {
  //       new TextMessage({
  //         text: "You failed the quest!",
  //         onComplete: () => {
  //           new YesNoPrompt({
  //             text: "Return to the main house?",
  //             onComplete: (yes) => {
  //               // Remove the quest from active quests
  //               if (
  //                 this.overworld.questManager.activeQuests["mediationQuest"]
  //               ) {
  //                 delete this.overworld.questManager.activeQuests[
  //                   "mediationQuest"
  //                 ];
  //               }
  //               if (this.overworld.questManager.failedQuests) {
  //                 this.overworld.questManager.failedQuests.delete(
  //                   "mediationQuest"
  //                 );
  //               }
  //               this.destroy();
  //               if (yes) {
  //                 // Reset to Home map and place hero at default position
  //                 this.overworld.startMap("Home", "sister", {
  //                   x: utils.withGrid(20),
  //                   y: utils.withGrid(10),
  //                   direction: "down",
  //                 });
  //               } else {
  //                 // Optionally, show the title screen or reload
  //                 this.overworld.showTitleScreen();
  //               }
  //             },
  //           }).init();
  //         },
  //       }).init();
  //     }, totalDuration);
  //   } else {
  //     // Fallback if animation not available
  //     new TextMessage({
  //       text: "You failed the quest!",
  //       onComplete: () => {
  //         this.destroy();
  //         this.overworld.startMap("Home", "sister", {
  //           x: utils.withGrid(20),
  //           y: utils.withGrid(10),
  //           direction: "down",
  //         });
  //       },
  //     }).init();
  //   }
  // }

  fail() {
    if (this.hasFailed) return;
    this.hasFailed = true;

    this.isActive = false;
    this.clearLegTimer();
    this.clearStepTimer();
    if (this.questArrow) this.questArrow.hide();
    const hero = this.map.gameObjects.hero;
    if (hero && typeof hero.playFailAnimation === "function") {
      hero.playFailAnimation();
      // Calculate how long the fail animation takes to play once
      const frames = hero.sprite.animations["fail"].length;
      const frameDuration = hero.sprite.animationFrameLimit * (1000 / 60); // assuming 60fps
      const totalDuration = frames * frameDuration;

      setTimeout(() => {
        new TextMessage({
          text: "You failed the quest!",
          onComplete: () => {
            new YesNoPrompt({
              onComplete: (yes) => {
                if (yes) {
                  this.destroy(); // Clean up this runner
                  this.overworld.questManager.activeQuests = {};
                  this.overworld.questManager.failedQuests = new Set();
                  setTimeout(() => {
                    this.overworld.startMap(
                      "HomeMediation",
                      "sister",
                      {
                        x: utils.withGrid(2),
                        y: utils.withGrid(7),
                        direction: "up",
                      },
                      50
                    );
                    setTimeout(() => {
                      this.overworld.questManager.startQuest("mediationQuest");
                    }, 100);
                  }, 0);
                } else {
                  this.map.isPaused = false;
                  window.location.reload();
                }
              },
            }).init();
            // this.complete;
          },
        }).init();
      }, totalDuration);
    } else {
      // Fallback if animation not available
      new TextMessage({
        text: "You failed the quest!",
        onComplete: () => {
          new YesNoPrompt({
            onComplete: (yes) => {
              if (yes) {
                if (
                  this.overworld.questManager.activeQuests["mediationQuest"]
                ) {
                  delete this.overworld.questManager.activeQuests[
                    "mediationQuest"
                  ];
                }
                if (this.overworld.questManager.failedQuests) {
                  this.overworld.questManager.failedQuests.delete(
                    "mediationQuest"
                  );
                }
                this.destroy();
                const quest = window.Quests["mediationQuest"];
                if (quest && typeof quest.onStart === "function") {
                  quest.onStart(this.overworld);
                } else {
                  this.overworld.startMediationQuest(quest);
                }
                this.complete;
              } else {
                this.destroy();
                this.overworld.showTitleScreen();
              }
            },
          }).init();
        },
        // this.complete;
      }).init();
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
