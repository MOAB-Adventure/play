/** Kind of like a weapon slot, but working by modifying a base model */
class WeaponInfusion {
  title = "";
  /** @type {InfusionLevelDescriptor[]} */
  levels = [];

  /** Default prerequisites. These apply to all levels. @type {ObjectPrerequisite[]} */
  prereqs = [];

  #tier = 0;
  get tier() {
    return this.#tier;
  }
  set tier(_) {
    this.#tier = clamp(_, 0, this.levels.length);
  }
  apply(o) {
    for (let l = 0; l < this.#tier; l++) this.levels[l].apply(o);
  }
  init() {
    this.levels.forEach((v, i, a) => {
      v.prereqs ??= [];
      v.prereqs.push(...this.prereqs);
      a[i] = constructFromType(v, InfusionLevelDescriptor);
    });
    delete this.prereqs;
  }
  attemptUpgrade() {
    const next = this.levels[this.#tier];
    if (!next) return false; //Index 0 is tier 1, stop if no later upgrade

    if (next.cost) {
      if (game.souls < next.cost) return false; //If not enough souls
      //Try to take the player's soul (not in game), and return false if it failed
      if (!removeSouls(next.cost)) return false;
    }
    this.#tier++;
    saveInfusions();
    return true;
  }
}
class InfusionLevelDescriptor extends ObjectAugmentor {
  desc = "";
  cost = 1;
}

const infusions = new Registry();
