class BossAction {
  duration = 1;
  animation = "";
  sound = "";
  #timer = 0;
  get complete() {
    return this.#timer > this.duration;
  }
  animate(entity) {
    if (this.animation) entity.getModel().fire(this.animation);
    if(this.sound) SoundCTX.play(this.sound);
  }
  /**
   * @param {Entity} entity
   */
  execute(entity) {} //Called once, on the first frame of this action
  /**
   * @param {Entity} entity
   */
  tick(entity) {
    this.#timer++;
  } //Called every frame of this action
  /**
   * @param {Entity} entity
   */
  end(entity) {
    this.#timer = 0;
  } //Called on the last frame of the action
}
class MovementAction extends BossAction {
  x = 0;
  y = 0;
  rot = 0;
  slide = 0;
  tick(entity) {
    super.tick(entity);
    entity.x += this.slide * Math.cos(entity.directionRad);
    entity.y += this.slide * Math.sin(entity.directionRad);

    entity.x += this.x / (this.duration + 1);
    entity.y += this.y / (this.duration + 1);
    entity.direction += this.rot / (this.duration + 1);
  }
}
class FireWeaponAction extends BossAction {
  slotIndex = 0;
  execute(entity) {
    if (entity.weaponSlots[this.slotIndex]?.weapon)
      entity.weaponSlots[this.slotIndex].weapon.fire();
  }
}
class ExitAction extends BossAction {
  execute(entity) {
    entity.hidden = true; //Stops bossbar finding it
    entity.oldX = entity.x; //Store old x for returning to
    entity.x = 32862587632756; //Put wayyyy offscreen
  }
}
//Also known as teleportation
class EntryAction extends BossAction {
  x = null;
  y = null;
  execute(entity) {
    entity.hidden = false; //Lets bossbar find it again
    entity.x = entity.oldX ?? 0; //Return to old x
    if (typeof this.x === "number") entity.x = this.x;
    if (typeof this.y === "number") entity.y = this.y;
  }
}
class RegenAction extends BossAction {
  amount = 0;
  tick(entity) {
    super.tick(entity);
    entity.heal(this.amount / this.duration);
  }
}
//boom
class SelfDestructAction extends BossAction {
  damage = 100;
  damageRadius = 200;
  damageType = "explosion";
  sparkColour = col.from(255, 245, 215, 255); //The colour the sparks start at
  sparkColourTo = col.from(255, 215, 0, 55); //The colour the sparks go to
  smokeColour = col.from(100, 100, 100, 200); //The colour the smoke starts at
  smokeColourTo = col.from(100, 100, 100, 0); //The colour the smoke goes to
  waveColour = col.from(255, 128, 0, 0); //The colour the wave ends at. It always starts white.
  blinds = false;
  blindOpacity = 0;
  blindDuration = 0;
  glareSize = 0;
  givesRewards = true;

  execute(entity) {
    entity.dead = true;
    entity.left = false
    splashDamageInstance(
      entity.x,
      entity.y,
      this.damage,
      this.damageType,
      this.damageRadius,
      entity,
      true,
      this.sparkColour,
      this.sparkColourTo,
      this.smokeColour,
      this.smokeColourTo,
      this.waveColour,
    );
    if (this.givesRewards) {
      //Give destroy rewards if there's a difference, regular rewards if not
      game.bloonstones += entity.destroyReward ?? entity.reward ?? 0;
    }
  }
}
class SpareAction extends BossAction {
  unlockedWeapon = "";
  execute(entity) {
    entity.dead = true;
    entity.left = true;
    Registry.weapons.get(this.unlockedWeapon);
    game.bossweapons.add(this.unlockedWeapon);
  }
}
//Creates an entity with an offset.
class SummonMinionAction extends BossAction {
  entity = "none";
  isPositionAbsolute = false;
  count = 1;
  offsetX = 0;
  randomOffsetX = 0;
  offsetY = 0;
  randomOffsetY = 0;
  rotationOffset = 0;
  //Displacement in the direction of the source + offset rotation
  slide = 0;
  isBoss = false;
  //A single character to represent the type of boss the summon is
  bossClass = "s";
  //Any differences?
  differences = {};
  //Max summons at any one time from this action. 0 is unlimited
  max = 0;
  /**@type {Entity[]} */
  #summoned = [];
  /**
   * @param {Entity} entity
   */
  execute(entity) {
    this.#summoned = this.#summoned.filter((x) => !x.dead);
    for (let i = 0; i < this.count; i++) {
      if (this.max > 0 && this.#summoned.length >= this.max) return;
      //get the entity
      let toSpawn = structuredClone(Registry.entities.get(this.entity));
      Object.assign(toSpawn, this.differences);
      //construct the entity
      /**@type {Entity} */
      let spawned =
        this.isBoss ?
          //Spawn it as a boss, if isBoss is true
          entity.world.spawnBoss(toSpawn, this.bossClass)
          //If not, spawn it normally
        : construct(toSpawn, Entity).addToWorld(entity.world);
      //Position and rotate the entity with trigonometry
      let xo =
          this.randomOffsetX * rnd(1, -1) +
          this.offsetX +
          Math.cos(degrees(this.rotationOffset)) * this.slide,
        yo =
          this.randomOffsetY * rnd(1, -1) +
          this.offsetY +
          Math.sin(degrees(this.rotationOffset)) * this.slide;
      if (this.isPositionAbsolute) {
        spawned.x = xo;
        spawned.y = yo;
        spawned.direction = this.rotationOffset;
      } else {
        spawned.x = entity.x + xo;
        spawned.y = entity.y + yo;
        spawned.direction = entity.direction + this.rotationOffset;
      }
      //"I created you, now do my bidding!"
      spawned.team = entity.team;
      if (this.max > 0) {
        this.#summoned.push(spawned);
      }
    }
  }
}
/**Like having a weapon, but also not having one at the same time.
 *Allows bullet hell attacks, without having to work with difficult weapon stuff.
 */
class SpawnBulletAction extends BossAction {
  xVar = 0;
  yVar = 0;
  x = 0;
  y = 0;
  direction = 0;
  bullet = {};
  amount = 1;
  spread = 0;
  spacing = 0;
  execute(entity) {
    //Spawn the bullets.
    patternedBulletExpulsion(
      this.x + rnd(-this.xVar, this.xVar),
      this.y + rnd(-this.yVar, this.yVar),
      this.bullet,
      this.amount,
      this.direction,
      this.spread,
      this.spacing,
      entity.world,
      entity,
      null,
    );
  }
}
/** Launches a bullet from a model part. Easier to use than weapons. */
class FireBulletAction extends BossAction {
  xVar = 0;
  yVar = 0;
  part = "main"; // the default part for drawer-converted entities.
  bullet = {};
  amount = 1;
  spread = 0;
  spacing = 0;
  delay = 0;
  /**@param {Boss} entity  */
  execute(entity) {
    let model = entity.getModel();

    model.timer.do(() => {
      model.eject(
        this.part,
        entity.x + rnd(-this.xVar, this.xVar),
        entity.y + rnd(-this.yVar, this.yVar),
        entity.direction,
        this.bullet,
        this.spread,
        this.spacing,
        this.amount,
        entity.world,
        entity
      );
    }, this.delay);
  }
}
// spawns a visual effect.
class VFXAction extends BossAction {
  effect = "none";
  part = "main"; // the default part for drawer-converted entities.
  delay = 0;
  /**@param {Boss} entity  */
  execute(entity) {
    let model = entity.getModel();
    model.timer.do(() => {
      let p = model.pos(this.part).rotate(entity.direction).addParts(entity.x, entity.y);
      createEffect(this.effect, entity.world, p.x, p.y, p.rotation, 1, () =>
        model.pos(this.part).rotate(entity.direction).addParts(entity.x, entity.y),
      );
    }, this.delay);
  }
}
//Changes a boss' speed for a time
class ChangeSpeedAction extends BossAction {
  speed = -1;
  turnSpeed = -1;
  changesBack = true;
  #oldSpeed = 0;
  #oldTurnSpeed = 0;
  execute(entity) {
    //if the speed is defined, and makes sense
    if (this.speed >= 0) {
      //save old speed, and change
      this.#oldSpeed = entity.speed;
      entity.speed = this.speed;
    }
    if (this.turnSpeed >= 0) {
      this.#oldTurnSpeed = entity.turnSpeed;
      entity.turnSpeed = this.turnSpeed;
    }
  }
  end(entity) {
    super.end(entity);
    if (this.changesBack) {
      //Change it back
      if (this.speed >= 0) {
        entity.speed = this.#oldSpeed;
      }
      if (this.turnSpeed >= 0) {
        entity.turnSpeed = this.#oldTurnSpeed;
      }
    }
  }
}
class DisableAIAction extends BossAction {
  execute(entity) {
    entity.aiActive = false;
  }
}
class EnableAIAction extends BossAction {
  execute(entity) {
    entity.aiActive = true;
  }
}
//Does a whole sequence of other actions.
//You'll need to set duration too, like with MultiAction.
class CollapsedSequenceAction extends BossAction {
  sequence = [];
  #action = 0;
  init() {
    let expanded = [];
    if (this.sequence)
      this.sequence.forEach((x) => {
        let aspos = x.indexOf("*") + 1;
        if (aspos) {
          let mul = parseInt(x.substring(0, aspos - 1));
          for (let i = 0; i < mul; i++) {
            expanded.push(x.substring(aspos));
          }
        } else expanded.push(x);
      });
    this.sequence = expanded;
    // console.log(this);
  }
  /**@param {Boss} entity  */
  tick(entity) {
    super.tick(entity);
    this.#action = entity.tickSeq(this.sequence, this.#action);
  }
}
//Does other actions at once. Won't compute duration by itself, though.
class MultiAction extends BossAction {
  actions = [];
  animate(entity) {
    super.animate(entity);
    this.actions.forEach((str) => entity.actions[str].animate(entity));
  }
  /**@param {Boss} entity  */
  execute(entity) {
    super.execute(entity);
    this.actions.forEach((str) => entity.actions[str].execute(entity));
  }
  tick(entity) {
    super.tick(entity);
    this.actions.forEach((str) => {
      if (!entity.actions[str].complete) entity.actions[str].tick(entity);
    });
  }
  end(entity) {
    super.end(entity);
    this.actions.forEach((str) => entity.actions[str].end(entity));
  }
}

class SetDataAction extends BossAction {
  name = "data";
  value = 1;
  /**@param {Boss} entity  */
  execute(entity) {
    entity.data.set(this.name, this.value);
  }
}

class ChangeVisualAction extends BossAction {
  model = {};
  changesBack = true;
  #oldmodel = null;
  init() {
    this.model = construct(this.model, Model);
  }
  /**@param {Boss} entity  */
  execute(entity) {
    if (this.changesBack) this.#oldmodel = entity.overrideModel;
    entity.overrideModel = this.model;
  }
  /**@param {Boss} entity  */
  end(entity) {
    if (this.changesBack) entity.overrideModel = this.#oldmodel;
  }
}
class ResetVisualAction extends BossAction {
  /**@param {Boss} entity  */
  execute(entity) {
    entity.overrideModel = null;
  }
}
class LobotomiseAction extends BossAction {
  /**@param {Boss} entity  */
  execute(entity) {
    entity.lobotomise();
  }
}
class StatusEffectAction extends BossAction {
  status = "none";
  clear = false;
  statusDuration = 180;
  /**@param {Boss} entity  */
  execute(entity) {
    if (this.status === "none") return;
    if (clear) entity.clearStatus(this.status);
    else entity.applyStatus(this.status, this.statusDuration);
  }
}
