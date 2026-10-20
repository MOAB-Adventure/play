class PointBullet extends Bullet {
  #moved = false; //If the bullet has teleported to the target entity or not.
  hitColour = col.red | col.green;
  hitColourTo = -1;
  init() {
    this.speed = 0; //Remove speed
    this.hitColour = col.convert(this.hitColour);
    if (this.hitColourTo === -1) {
      this.hitColourTo = col.hide(this.hitColour);
    } else this.hitColourTo = col.convert(this.hitColourTo);
  }
  step(dt) {
    //Move if not already done so
    if (!this.#moved) {
      this.#moved = true;
      if (this.entity) {
        //If a target exists
        if (this.entity.target) {
          let tpos = new Vector(this.entity.target.x, this.entity.target.y);
          //Point towards it, like a weapon
          this.direction = this.pos.sub(tpos).angle;
          //Create line to it
          this.createTrailTo(tpos.x, tpos.y);
          //Teleport to it
          this.pos = tpos;
          this.hitEffect();
          this.checkEntities();
        } else {
          //Delete self
          this.remove = true;
          return;
        }
      }
    }
    super.step(dt);
  }
  draw() {} //Totally invisible
  createTrailTo(x, y) {
    let distance = dist(this.x, this.y, x, y);
    this.world.particles.push(
      new ShapeParticle(
        //Find halfway point
        (this.x + x) / 2,
        (this.y + y) / 2,
        this.directionRad,
        30,
        0,
        0,
        "rect",
        this.hitColour,
        this.hitColourTo,
        this.hitSize,
        this.hitSize,
        distance,
        distance,
        0,
        true,
      ),
    );
  }
  hitEffect() {
    let direction = rnd(0, 360); //Random direction
    this.world.particles.push(
      //Create hit effect
      new ShapeParticle(
        this.x,
        this.y,
        radians(direction),
        30,
        0,
        0,
        "rhombus",
        this.hitColour,
        this.hitColourTo,
        this.hitSize * 5,
        0,
        0,
        this.hitSize * 40,
        0,
        true,
      ),
      new ShapeParticle(
        this.x,
        this.y,
        radians(direction + 90),
        30,
        0,
        0,
        "rhombus",
        this.hitColour,
        this.hitColourTo,
        this.hitSize * 5,
        0,
        0,
        this.hitSize * 25,
        0,
        true,
      ),
      new WaveParticle(
        this.x,
        this.y,
        30,
        0,
        this.hitSize * 20,
        this.hitColour,
        this.hitColourTo,
        0,
        this.hitSize * 3,
        true,
      ),
    );
  }
}
