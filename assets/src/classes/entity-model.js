class Model {
  /**@type {{[name: string]: ModelPart}} */
  parts = {};
  /**@type {{[name: string]: ModelAnimation}} */
  animations = {};
  /**@type {ModelMovement[]} */
  constant = [];
  /**@type {Timer} */
  timer = new Timer();
  displayWidth = 0;
  displayHeight = 0;
  init() {
    for (const name in this.parts) {
      if (!Object.hasOwn(this.parts, name)) continue;

      const element = this.parts[name];
      this.parts[name] = construct(element, ModelPart);
      // console.log(name, this.parts[name].pos(this, 0, 0, 0));
    }
    for (const name in this.animations) {
      if (!Object.hasOwn(this.animations, name)) continue;

      const element = this.animations[name];
      this.animations[name] = construct({ movements: element }, ModelAnimation);
    }
    this.constant.forEach((v, i, a) => (a[i] = construct(v, ModelMovement)));
  }
  fire(name) {
    if (Object.hasOwn(this.animations, name)) this.animations[name].on(this);
  }
  freeze() {
    this.timer.cancel("*");
  }
  move(name, x, y, rot, slide) {
    const p = this.parts[name];
    if (!p) {
      console.warn("Animation references part '" + name + "', which doesn't exist.");
      return;
    }
    p.x += x;
    p.y += y;
    p.direction += rot;
    p.slide += slide;
  }
  details(name) {
    const p = this.parts[name];
    if (!p) {
      console.warn("Animation references part '" + name + "', which doesn't exist.");
      return [0, 0, 0, 0];
    }
    return [p.x, p.y, p.direction, p.slide];
  }
  get(name) {
    const p = this.parts[name];
    if (!p) {
      console.warn("Animation references part '" + name + "', which doesn't exist.");
    }
    return p;
  }
  pos(name) {
    const p = this.parts[name];
    if (!p) {
      console.warn("Animation references part '" + name + "', which doesn't exist.");
      return new Orientation();
    }
    return p.pos(this);
  }
  tick() {
    this.timer.tick();
    this.constant.forEach((m) =>
      this.move(
        m.part,
        m.dx / m.duration,
        m.dy / m.duration,
        m.drot / m.duration,
        m.dslide / m.duration,
      ),
    );
  }
  draw(x, y, rotation) {
    for (const part in this.parts) {
      if (!Object.hasOwn(this.parts, part)) continue;

      const element = this.parts[part];

      element.draw(this, x, y, rotation);
    }
  }
  hitTest(x, y, rotation, hx, hy, hsize) {
    for (const part in this.parts) {
      if (!Object.hasOwn(this.parts, part)) continue;

      if (this.parts[part].hitTest(this, x, y, rotation, hx, hy, hsize)) return part;
    }
    return null;
  }
  eject(name, ox, oy, od, bullet, spread, spacing, amount, world, entity) {
    const p = this.parts[name];
    if (!p) {
      console.warn("Animation references part '" + name + "', which doesn't exist.");
      return;
    }
    p.eject(this, ox, oy, od, bullet, spread, spacing, amount, world, entity);
  }
}

class ModelPart {
  x = 0;
  y = 0;
  direction = 0;
  width = 0;
  height = 0;
  slide = 0;
  image = null;
  shape = "rect";
  colour = col.mono(100);
  rotate = true;
  absRot = false;
  anchor = "";
  outl = false;
  hidden = false;
  init() {
    this.colour = col.convert(this.colour);
  }
  /**Returns the *relative* position of this part, and its rotation.
   * @param {Model} model The model to draw on.
   * @returns {Orientation} */
  pos(model) {
    /**@type {Orientation} */
    let origin = this.anchor === "" ? Orientation.ZERO : model.pos(this.anchor);

    let relpos = new Vector(this.x, this.y).add(Vector.fromAngle(this.direction).scale(this.slide));
    let rotpos = relpos.rotate(origin.rotation);
    let np = origin.addParts(rotpos.x, rotpos.y, this.direction);
    return np;
  }

  /**@param {Model} model  */
  draw(model, x, y, rotation) {
    if (this.hidden) return;
    let p = this.pos(model).rotate(rotation).addParts(x, y);
    if (this.image instanceof ImageContainer || typeof this.image === "string") {
      //If it's an image, draw it
      ImageCTX.draw(
        this.image,
        p.x,
        p.y,
        this.width,
        this.height,
        this.rotate ? radians(p.rotation) : 0,
      );
    } else {
      //If it isn't, draw a rectangle
      push();
      if (this.outl) {
        strokeWeight(5);
        col.stroke(this.colour);
        noFill();
      } else col.fill(this.colour);
      rotatedShape(
        this.shape,
        p.x,
        p.y,
        this.width,
        this.height,
        this.rotate ? radians(p.rotation) : 0,
      );
      pop();
    }
  }
  hitTest(model, x, y, rotation, hx, hy, hsize) {
    let finalPos = this.pos(model).rotate(rotation).addParts(x, y).pos;
    return finalPos.distanceToXY(hx, hy) <= hsize + (this.width + this.height) / 4;
  }
  /**@param {Model} model  */
  eject(model, ox, oy, od, bullet, spread, spacing, amount, world, entity) {
    let p = this.pos(model).rotate(od).addParts(ox, oy);
    patternedBulletExpulsion(p.x, p.y, bullet, amount, p.rotation, spread, spacing, world, entity);
  }
}

class ModelAnimation {
  /**@type {ModelMovement[]} */
  movements = [];
  init() {
    // console.log(this);
    this.movements.forEach((v, i, a) => (a[i] = construct(v, ModelMovement)));
  }
  /**@param {Model} model */
  on(model) {
    this.movements.forEach((m) => m.on(model));
  }
}

class ModelMovement {
  part = "";
  dx = 0;
  dy = 0;
  drot = 0;
  dslide = 0;
  duration = 0;
  delay = 0;
  on(model) {
    model.timer.repeat(
      () =>
        model.move(
          this.part,
          this.dx / this.duration,
          this.dy / this.duration,
          this.drot / this.duration,
          this.dslide / this.duration,
        ),
      this.duration,
      1,
      this.delay,
    );
  }
}
