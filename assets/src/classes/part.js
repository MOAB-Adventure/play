/** Basic component for in-game rendered objects. */
class Part {
  image = null;
  x = 0;
  y = 0;
  slide = 0;
  rotation = 0;
  width = 0;
  height = 0;
  colour = col.mono(200);

  get rotationRadians() {
    return (this.rotation / 180) * Math.PI;
  }
  get totalXOffset() {
    return 0;
  }
  get totalYOffset() {
    return 0;
  }
  get totalRotOffset() {
    return 0;
  }
  get totalSlideOffset() {
    return 0;
  }
  draw(x, y, rotation) {
    let pos = new Vector(x, y);
    let angle = rotation + this.rotation + this.totalRotOffset;
    let xOffsetVct = Vector.fromAngle(rotation).scale(this.x + this.totalXOffset); //Relative horizontal offset from weapon centre
    let yOffsetVct = Vector.fromAngle(rotation + 90).scale(this.y + this.totalYOffset); //Relative vertical offset from weapon centre
    let slideVct = Vector.fromAngle(angle).scale(this.slide + this.totalSlideOffset); //Offset in the direction of the part
    let toffset = yOffsetVct.add(xOffsetVct.add(slideVct));
    let finalPos = pos.add(toffset); //Add them all up
    if (this.image instanceof ImageContainer || typeof this.image === "string") {
      //If it's an image, draw it
      ImageCTX.draw(this.image, finalPos.x, finalPos.y, this.width, this.height, radians(angle));
    } else {
      //If it isn't, draw a rectangle
      push();
      col.fill(this.colour);
      rotatedShape("rect", finalPos.x, finalPos.y, this.width, this.height, radians(angle));
      pop();
    }
  }
  init() {
    this.colour = col.convert(this.colour);
  }
  tick() {}
}

/** Animated parts for weapons. Is auto-converted to if recoil animations are present 👍 */
class WeaponPart extends Part {
  chargeAnimations = [];
  recoilAnimations = [];
  passiveAnimations = [];

  fusedAnimations = [];

  get totalXOffset() {
    let totalOffset = 0;
    for (let ani of this.fusedAnimations) {
      totalOffset += ani.xOffset;
    }
    return totalOffset;
  }
  get totalYOffset() {
    let totalOffset = 0;
    for (let ani of this.fusedAnimations) {
      totalOffset += ani.yOffset;
    }
    return totalOffset;
  }
  get totalRotOffset() {
    let totalOffset = 0;
    for (let ani of this.fusedAnimations) {
      totalOffset += ani.rotOffset;
    }
    return totalOffset;
  }
  get totalSlideOffset() {
    let totalOffset = 0;
    for (let ani of this.fusedAnimations) {
      totalOffset += ani.slideOffset;
    }
    return totalOffset;
  }
  init() {
    super.init();
    //For each index of charge animation
    for (let i = 0; i < this.chargeAnimations.length; i++) {
      this.chargeAnimations[i] = construct(this.chargeAnimations[i], PartAnimation); //Override with constructed version
    }
    //Same but for recoil
    for (let i = 0; i < this.recoilAnimations.length; i++) {
      this.recoilAnimations[i] = construct(this.recoilAnimations[i], RecoilAnimation);
    }
    //Same but for passive
    for (let i = 0; i < this.passiveAnimations.length; i++) {
      this.passiveAnimations[i] = construct(this.passiveAnimations[i], LoopingAnimation);
    }
    //Start all passive animations
    for (let ani of this.passiveAnimations) {
      ani.start();
    }

    this.fusedAnimations = [
      ...this.chargeAnimations,
      ...this.recoilAnimations,
      ...this.passiveAnimations,
    ];
  }
  tick() {
    for (let ani of this.fusedAnimations) {
      ani.tick(1);
    }
  }
  preFire() {
    for (let ani of this.chargeAnimations) {
      ani.start();
    }
  }
  //Fires on parent weapon fire.
  fire() {
    for (let ani of this.recoilAnimations) {
      ani.start();
    }
    for (let ani of this.chargeAnimations) {
      ani.onEnd();
    }
  }
}
