class GameObject {
  constructor(config) {
    this.id = config.id ?? null;
    this.type = config.type ?? null;
    this.isMounted = false;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.direction = config.direction || "down";
    this.scale = config.scale || 1;
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || "./images/characters/people/hero.png",
    });

    //These happen once on map startup.
    this.behaviorLoop = config.behaviorLoop || [];
    this.behaviorLoopIndex = 0;
    this.behaviorLoopActive = false;
    this.talking = config.talking || [];
    this.retryTimeout = null;
  }

  mount(map) {
    if (this.isMounted) {
      console.warn("Already mounted:", this.id);
      return;
    }
    this.isMounted = true;
    this.map = map;
    //If we have a behavior, kick off after a short delay
    if (this.behaviorLoop && this.behaviorLoop.length > 0) {
      setTimeout(() => {
        this.startBehaviorLoop(map);
      }, 10);
    }
  }

  unmount() {
    if (this.sprite) {
      // Remove sprite-related hooks or rendering references
      this.sprite = null;
    }
    if (this.behaviorLoop) {
      this.behaviorLoop = [];
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.remove();
    }

    if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  update() {}

  startBehaviorLoop(map) {
    if (this.isBehaviorLoopActive) return;
    this.isBehaviorLoopActive = true;
    this.doBehaviorEvent(map);
  }

  stopBehaviorLoop() {
    this.isBehaviorLoopActive = false;
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
  }

  async doBehaviorEvent(map) {
    if (!this.isBehaviorLoopActive) {
      return;
    }
    if (this.behaviorLoop.length === 0) {
      return;
    }

    if (map.isCutscenePlaying) {
      if (this.retryTimeout) clearTimeout(this.retryTimeout);
      this.retryTimeout = setTimeout(() => {
        this.doBehaviorEvent(map);
      }, 1000);
      return;
    }

    let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id;
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init();

    this.behaviorLoopIndex =
      (this.behaviorLoopIndex + 1) % this.behaviorLoop.length;
    this.doBehaviorEvent(map);
  }
}

window.GameObject = GameObject;
