class QuestManager {
  constructor({ overworld, onQuestStart, onQuestEnd }) {
    this.overworld = overworld;
    this.onQuestStart = onQuestStart;
    this.onQuestEnd = onQuestEnd;
    this.activeQuests = {};
    this.completedQuests = new Set();
    this.failedQuests = new Set();
    this.questDefinitions = window.Quests;
    this.timers = {};
  }

  setMap(map) {
    this.map = map;
  }

  startQuest(questId) {
    const quest = this.questDefinitions[questId];
    if (!quest || this.activeQuests[questId]) return;

    console.log(`Starting quest: ${questId}`);

    if (quest.timer) {
      if (!this.timers) this.timers = {};
      if (this.timers[questId]) {
        clearTimeout(this.timers[questId]);
        delete this.timers[questId];
      }
      // Start the timer
      if (window.questTimer) {
        window.questTimer.start(questId, quest.timer, quest.milestones);
      }
    }

    this.activeQuests[questId] = {
      ...quest,
      id: questId,
      state: "active",
      startTime: Date.now(),
      duration: quest.timer || null,
    };

    quest.previousMusic = window.lastMusicSrc;

    if (quest.music) {
      this.overworld.map.handleMusicEvent({ src: quest.music, loop: true });
    }

    if (this.onQuestStart) {
      this.onQuestStart(questId, quest);
    }

    this.spawnQuestObjectsForCurrentMap(quest);

    // Trigger optional start events
    if (quest.onStart) {
      quest.onStart(this.overworld);
    }
  }

  spawnQuestObjectsForCurrentMap(quest) {
    if (!quest.spawnObjects) return;
    const currentMapId = this.overworld.map.id;
    quest.spawnObjects.forEach((obj) => {
      if (
        obj.map === currentMapId &&
        !window.playerState.pickedUpQuestObjects.includes(obj.id) &&
        !this.overworld.map.gameObjects[obj.id]
      ) {
        this.overworld.addGameObject({ ...obj });
      }
    });
  }

  completeQuest(questId) {
    if (!this.activeQuests[questId]) return;

    console.log(`Quest completed: ${questId}`);
    if (this.timers && this.timers[questId]) {
      clearTimeout(this.timers[questId]);
      delete this.timers[questId];
    }
    if (window.questTimer) {
      window.questTimer.stop();
    }
    delete this.activeQuests[questId];
    this.completedQuests.add(questId);

    const quest = this.questDefinitions[questId];

    // Trigger any success events
    if (quest.onComplete) {
      quest.onComplete(this.overworld);
    }

    if (this.onQuestEnd) {
      this.onQuestEnd(questId);
    }

    // Remove objects if needed
    if (quest.despawnOnComplete) {
      quest.spawnObjects?.forEach((obj) => {
        const gameObj = this.overworld.gameObjects?.[obj.id];
        if (gameObj && typeof gameObj.unmount === "function") {
          gameObj.unmount();
          delete this.overworld.gameObjects[obj.id];
        }
      });
    }
    // Branching quests
    if (quest.branches) {
      const nextQuestId = quest.branches.success;
      if (nextQuestId) {
        this.startQuest(nextQuestId);
      }
    }
    if (this.timers && this.timers[questId]) {
      clearTimeout(this.timers[questId]);
      delete this.timers[questId];
    }
    if (window.questTimer) {
      window.questTimer.stop();
    }
    delete this.activeQuests[questId];
    this.completedQuests.add(questId);
  }

  failQuest(questId) {
    if (!this.activeQuests[questId]) return;

    console.log(`Quest failed: ${questId}`);
    if (this.timers && this.timers[questId]) {
      clearTimeout(this.timers[questId]);
      delete this.timers[questId];
    }
    if (window.questTimer) {
      window.questTimer.stop();
    }
    delete this.activeQuests[questId];
    this.failedQuests.add(questId);

    const quest = this.questDefinitions[questId];

    // Despawn objects
    quest.spawnObjects?.forEach((obj) => {
      const object = this.overworld.map.gameObjects[obj.id];
      if (!object) {
        console.warn(`GameObject with id ${obj.id} not found for despawn.`);
        return;
      }
      if (this.overworld.map.gameObjects[obj.id]) {
        this.overworld.map.gameObjects[obj.id].unmount();
        delete this.overworld.map.gameObjects[obj.id];
      }
    });

    if (this.onQuestEnd) {
      this.onQuestEnd(questId);
    }

    // Optional fail handler
    if (quest.onFail) {
      quest.onFail(this.overworld);
    }
    if (quest.branches) {
      const failQuestId = quest.branches.fail;
      if (failQuestId) {
        this.startQuest(failQuestId);
      }
    }
  }

  retryQuest(questId) {
    setTimeout(() => {
      console.log(`Retrying quest: ${questId}`);
      this.startQuest(questId);
    }, 1000); // Or delay based on quest.retryDelay
  }

  checkInventoryRequirement(questId, requiredItems) {
    return requiredItems.every((item) => {
      return playerState.inventory.includes(item);
    });
  }

  checkCustomEventTrigger(questId, triggerFlag) {
    return !!playerState.storyFlags[triggerFlag];
  }

  update() {
    for (let questId in this.activeQuests) {
      const quest = this.questDefinitions[questId];
      if (quest.successConditions) {
        const conditionsMet = quest.successConditions.every((cond) => {
          if (cond.type === "inventory") {
            return this.checkInventoryRequirement(questId, cond.items);
          } else if (cond.type === "flag") {
            return this.checkCustomEventTrigger(questId, cond.flag);
          } else if (cond.type === "nerfsCollected") {
            let count = 0;
            if (cond.byType) {
              count = playerState.inventory.filter(
                (entry) => entry.type === cond.byType
              ).length;
            } else if (cond.byId) {
              count = ((entry) => cond.byId.includes(entry.id)).length;
            }
            return count >= (cond.count || 0);
          } else if (
            cond.type === "custom" &&
            typeof cond.check === "function"
          ) {
            return cond.check(this.overworld);
          }
          return false;
        });

        if (conditionsMet) {
          this.completeQuest(questId);
        }
      }
    }
  }
}
