class Box extends ScalingEntity {
  //Default box, for undefined world spawning entity
  static get default() {
    return Registry.entities.get("wooden-box");
  }
  //Basic metal box
  static get metal() {
    return Registry.entities.get("metal-box");
  }
  //Rewards
  reward = 0;
  destroyReward = 0;
  //No moving unless explicitly stated
  speed = 0;
  square = true; //Can't rotate
  onDeath(source) {
    //Give destroy reward
    game.shards += this.destroyReward ?? 0;
    if (!source) return;
    source.destroyed.boxes++;
  }
  tick() {
    if (!this.dead) {
      super.tick();
      //Move
      this.x -= game.player.speed + this.speed;
      if (this.x < game.borderLeft - this.hitSize) {
        this.dead = true;
        this.left = true;
        //Give basic reward
        game.shards += this.reward ??= 0;
      }
      if (this.square) this.direction = 0;
      // damage in here
      if (this.collides)
        for (let entity of this.world.entities) {
          //If this is colliding with a living entity on a different team (that isn't boosting)
          if (!entity.dead && entity.collides && !entity._boost && entity.team !== this.team && this.collidesWith(entity)) {
            // then hit them
            entity.damage("collision", this.health, this);
            //If they didn't die i.e. resisted, shielded, had more HP, etc.
            if (!entity.dead) {
              //Remove box
              this.dead = true;
            }
          }
        }
    }
  }
  scaleToDifficulty() {
    let diff = Registry.difficulties.get(game.difficulty); //Get difficulty
    this.health *= diff.boxHP ?? 1; //Multiply HP by box HP multiplier
  }
}
class AngryBox extends Box {
  tick() {
    if (!this.dead) {
      this.target = this.world.nearestEnemyTo(this.x, this.y, this.team);
      super.tick();
      if (this.target)
        this.weaponSlots.forEach(s => {
          if (s?.weapon) s.weapon.fire();
        });
    }
  }
}
