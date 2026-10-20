class Booster extends Weapon {
  boostPower = 1;
  boostDuration = 1;
  trailDuration = 10;
  knockOthers = true;
  hasFireTrail = true;
  trailBullet = null;
  burstBullet = null;

  directions = 1;
  themeColour = col.from(255, 128, 0);
  init() {
    super.init();
    delete this.shoot;
    delete this.recoil;
  }
  tick() {
    if (!this.slot) return;
    if (this.slot.entity) {
      this.x = this.slot.entity.x + this.slot.posX;
      this.y = this.slot.entity.y + this.slot.posY;
      if (this.rotate) {
        let d = this.slot.entity.velocity.angle;
        let dirInterval = 360 / this.directions;
        this.rotation = Math.round(d / dirInterval) * dirInterval;
      } else {
        this.rotation = this.slot.entity.direction;
      }
    }
    this.decelerate();
    if (this._cooldown > 0) {
      this._cooldown--;
    }
    this.parts.forEach(x => x.tick()); //Tick all parts
  }
  fire() {
    if (this._cooldown <= 0 && !this.slot.entity._boost) {
      SoundCTX.play(this.fireSound);
      this._cooldown = this.getAcceleratedReloadRate();
      this.accelerate(); //Apply acceleration effects

      if (this.hasFireTrail) {
        patternedBulletExpulsion(
          this.x,
          this.y,
          {
            type: "laser",
            length: this.boostPower,
            extendTime: 1,
            despawnTime: 1,
            hitSize: this.boostPower / 4,
            lifetime: this.boostDuration,
            followsSource: true,
            status: "ignited",
            statusDuration: 180,
            damage: [{ amount: 1, type: "fire" }],
            drawer: { shape: "ellipse", fill: col.from(255, 128, 0) },
          },
          1,
          this.rotation + 180,
          0,
          0,
          this.slot.entity.world,
          this.slot.entity,
          this,
        );
      }

      const b = new Boost();
      b.trail = this.trailBullet;
      b.burst = this.burstBullet;
      b.direction = this.rotation;
      b.duration = this.boostDuration;
      b.power = this.boostPower;

      this.slot.entity._boost = b;
      // Timer.main.repeat(
      //   () => {
      //     this.slot.entity.knock(this.boostPower, this.rotation, this.knockOthers);
      //     this.tick();

      //     this.slot.entity.world.particles.push(
      //       new AfterImageParticle(
      //         this.slot.entity.x,
      //         this.slot.entity.y,
      //         this.slot.entity.directionRad,
      //         this.trailDuration,
      //         0,
      //         0,
      //         this.slot.entity.drawer.image,
      //         this.slot.entity.drawer.width ?? 1,
      //         this.slot.entity.drawer.width ?? 1,
      //         this.slot.entity.drawer.height ?? 1,
      //         this.slot.entity.drawer.height ?? 1,
      //         0,
      //         false,
      //       ),
      //     );
      //     if (this.trailBullet) {
      //       patternedBulletExpulsion(
      //         this.x,
      //         this.y,
      //         this.trailBullet,
      //         1,
      //         this.rotation + 180,
      //         0,
      //         0,
      //         this.slot.entity.world,
      //         this.slot.entity,
      //         this,
      //         true,
      //       );
      //     }
      //   },
      //   this.boostDuration,
      //   1,
      // );

      this.parts.forEach(x => x.fire && x.fire()); //Tick all parts
    }
  }
}
class Boost {
  direction = 0;
  duration = 6;
  power = 20;
  trail = null;
  burst = null;
  ended = false;
  /** @param {Entity} entity  */
  tick(entity) {
    this.duration--;
    if (this.duration <= 0) {
      this.ended = true;
      if (this.burst) patternedBulletExpulsion(entity.x, entity.y, this.burst, 1, this.direction, 0, 0, entity.world, entity, null, true);
    } else {
      entity.knock(this.power, this.direction, true);
      if (this.trail) patternedBulletExpulsion(entity.x, entity.y, this.trail, 1, this.direction, 0, 0, entity.world, entity, null, true);
    }
  }
}
