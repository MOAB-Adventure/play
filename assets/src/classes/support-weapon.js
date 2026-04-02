// Literally the same except the bullet starts at the target entity
class SupportWeapon extends Weapon {
  fire() {
    if (this._cooldown <= 0) {
      SoundCTX.play(this.fireSound);
      this._cooldown = this.getAcceleratedReloadRate();
      this.accelerate(); //Apply acceleration effects

      if(this.recoil) this.slot.entity.knock(this.recoil, this.rotation + 180);

      patternedBulletExpulsion(
        this.slot.entity.target.x,
        this.slot.entity.target.y,
        this.shoot?.bullet ?? {},
        this.shoot?.pattern?.amount ?? 1,
        this.rotation + (this.shoot?.pattern?.offset ?? 0),
        this.shoot?.pattern?.spread ?? 0,
        this.shoot?.pattern?.spacing ?? 0,
        this.slot.entity.world,
        this.slot.entity.target,
        this
      );
      this.parts.forEach((x) => x.fire && x.fire()); //Tick all parts
    }
  }
}
class ShieldProjector extends SupportWeapon {
  strength = 100;
  spawnTime = 15;
  reshield = false;
  reshieldPulses = 3;
  fire() {
    if (this._cooldown <= 0 && (this.reshield || !this.slot.entity.target._shield)) {
      SoundCTX.play(this.fireSound);
      this._cooldown = this.getAcceleratedReloadRate();
      this.accelerate(); //Apply acceleration effects

      if(this.recoil) this.slot.entity.knock(this.recoil, this.rotation + 180);

      this.slot.entity.target.shield(this.strength, this.spawnTime, this.shoot.bullet ?? {}, this.reshieldPulses);
      this.parts.forEach((x) => x.fire && x.fire()); //Tick all parts
    }
  }
}
