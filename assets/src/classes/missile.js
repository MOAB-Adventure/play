class Missile extends Bullet {
  target = null;
  trailColour = col.from(255, 255, 100, );
  trailColourTo = col.red;
  flameLength = 200;
  trail = true;
  trailInterval = -1;
  turnSpeed = 1;
  trackingRange = 5000;
  retarget = true;
  trailType = "linear";
  trailShape = "circle";
  targetType = "mouse"; //"nearest", "mouse", "hovered"

  init() {
    super.init();
    if (this.trailInterval === -1) {
      this.trailInterval = this.speed / this.hitSize;
    }
  }
  rotateTowards(x, y, amount) {
    let res = turn(this.direction, this.x, this.y, x, y, amount);
    this.direction = res.direction;
    // let maxRotateAmount = radians(amount); //use p5 to get radians
    // let delta = { x: x - this.x, y: y - this.y };
    // //Define variables
    // let currentDirection = Vector.fromAngle(this.directionRad).angleRad; //Find current angle, standardised
    // let targetDirection = Math.atan2(delta.y, delta.x); //Find target angle, standardised
    // if (targetDirection === currentDirection) return; //Do nothing if facing the right way
    // let deltaRot = targetDirection - currentDirection;
    // //Rotation correction
    // if (deltaRot < -PI) {
    //   deltaRot += TWO_PI;
    // } else if (deltaRot > PI) {
    //   deltaRot -= TWO_PI;
    // }
    // let sign = deltaRot < 0 ? -1 : 1; //Get sign: -1 if negative, 1 if positive
    // let deltaD = 0;
    // //Choose smaller turn
    // if (Math.abs(deltaRot) > maxRotateAmount) {
    //   deltaD = maxRotateAmount * sign;
    // } else {
    //   deltaD = deltaRot;
    // }
    // //Turn
    // this.direction += degrees(deltaD);
  }

  getTrailLife() {
    return this.flameLength / this.speed;
  }
  step(dt) {
    super.step(dt);
    if (this.target && !this.target.dead && !this.target.remove) {
      //If target still there
      this.rotateTowards(this.target.x, this.target.y, this.turnSpeed);
      if (!this.retarget) return;
    }
    let selected = null;
    if (this.targetType === "nearest") {
      //Closest to bullet
      if (this.world) {
        //If the bullet exists
        let minDist = Infinity;
        for (let entity of this.world.entities) {
          if (entity.team !== this.entity.team && !entity.dead) {
            //Only select living entities
            let dist = Math.sqrt(
              (this.x - entity.x) ** 2 + (this.y - entity.y) ** 2
            ); //Pythagorean Theorem to find distance
            if (dist < minDist && dist <= this.trackingRange) {
              //If closer
              selected = entity;
              minDist = dist;
            }
          }
        }
      }
    } else if (this.targetType === "hovered") {
      //Closest to mouse pointer
      if (this.world) {
        //If the bullet exists
        let minDist = Infinity;
        for (let entity of this.world.entities) {
          if (entity.team !== this.entity.team && !entity.dead) {
            //Only select living entities
            let dist = Math.sqrt(
              (ui.mouse.x - entity.x) ** 2 + (ui.mouse.y - entity.y) ** 2
            ); //Pythagorean Theorem to find distance
            if (dist < minDist) {
              //If closer
              selected = entity;
              minDist = dist;
            }
          }
        }
      }
    } else if (this.targetType === "mouse") {
      //Closest to mouse pointer
      selected = ui.mouse;
    }
    this.target = selected;
  }
  draw() {
    super.draw();
    if (UIComponent.evaluateCondition("debug:true")) {
      push();
      stroke(255);
      strokeWeight(5);
      noFill();
      if (this.target) {
        line(this.x, this.y, this.target.x, this.target.y);
        strokeWeight(1);
      }
      stroke(255, 100);
      circle(this.x, this.y, this.trackingRange * 2);
      pop();
    }
  }
}
