//Goes up to a decillion (1 000 000 000 000 000 000 000 000 000 000). No-one will ever need that much stuff, so it should be enough.
const sizes = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "d"];

/**Shortens a number with human-friendly notation.
 * Does not round, but truncates instead, e.g. 12850 -> 1.28k
 */
function shortenedNumber(num = 0, digits = 3) {
  if(typeof num !== "number") num = 0;
  let exponential = num.toExponential();
  //Split the first bit and the power of 10
  let parts = exponential.split("e");
  let shownNum = parseFloat(parts[0].substring(0, digits + 1)); //Only use first N digits
  let poT = parseInt(parts[1]);
  //Get size part
  let sizeIndex = Math.max(Math.floor(poT / 3), 0);
  let shownNumSize = poT % 3;
  //Assemble
  let suffix = sizes[sizeIndex];
  return suffix != undefined ? `${roundNum(shownNum * 10 ** shownNumSize, 2)}${suffix}` : "∞";
}
function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}
/**Rounds a number to a specified number of decimal places. */
function roundNum(number, dp = 0) {
  return Math.round(number * 10 ** dp) / 10 ** dp;
}
/**Returns a random number between `a` and `b`. If `b` is missing, `-a` will be substituted.*/
function rnd(a, b) {
  if (b == undefined) return rnd(a, -a);
  if (a === b) return a;
  return a + Math.random() * (b - a);
}
/**Returns `true` with a specified chance. */
function tru(chance) {
  return Math.random() < chance;
}
/**Creates a sort function based on an object property. Use `"-(property)"`, such as `"-health"`, to sort in reverse. Works on string and number values.*/
function dynamicSort(property) {
  let sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substring(1);
  }
  return (a, b) => (a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0) * sortOrder;
}

/**
 * Colour Interpolation function. Finds a colour along a virtual gradient, with arbitrary stops.\
 * *god this took forever i hate everything*
 * @param {int[][]} cols Array of colours. Must all be the same length, or NaNs pop up. Gradient goes from start to end of array.
 * @param {float} factor Number 0-1. How far along the gradient the point is, from the start.
 * @param {boolean} [forceint=false] If true, will round the outputs to force them to be integer. Probably required for most uses.
 * @returns {int[]} An array representing the colour at the specified point along the gradient. The final colour in the array, if `factor` is too large.
 */
function colinterp(cols, factor, forceint = false) {
  let l = cols.length;
  let n = l - 1;
  if (l < 2) return cols[0];
  //Look at each gap between numbers
  for (let choice = 1; choice < l; choice++) {
    if (factor < choice / n) {
      //Set some temporary variables
      let c1 = cols[choice - 1],
        c2 = cols[choice],
        fact = (factor - (choice - 1) / n) * n;
      //Interpolate between the 2 chosen colours
      let o = Math.max(c1.length, c2.length); //Allows colour arrays of any length
      let out = [];
      for (let i = 0; i < o; i++) out.push((c1[i] ?? 255) * (1 - fact) + (c2[i] ?? 255) * fact);
      return forceint ? out.map((x) => Math.round(x)) : out;
    }
  }
  return cols.at(-1);
}

/**
 * A class representing a 2D vector structure.
 */
class Vector {
  /**@readonly */
  static ZERO = new this(0, 0);
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  #x = 0;
  #y = 0;
  constructor(x = 0, y = 0) {
    this.#x = x;
    this.#y = y;
  }
  /** The length of the hypotenuse of the triangle formed by this vector's X- and Y-values as lengths. */
  get magnitude() {
    return Math.sqrt(this.#x * this.#x + this.#y * this.#y);
  }
  /**
   * Adds 2 vectors.
   * @param {Vector} vct Vector to add.
   * @returns The result of the addition. Either this vector, or the new one.
   */
  add(vct) {
    return this.addXY(vct.x, vct.y);
  }
  /**
   * Adds an x- and y-value to a vector.
   * @param {float} x X-value to add.
   * @param {float} y Y-value to add.
   * @returns The result of the addition. Either this vector, or the new one.
   */
  addXY(x, y) {
    return new Vector(this.#x + x, this.#y + y);
  }
  /**
   * Subtracts another vector from this one.
   * @param {Vector} vct Vector to subtract.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the subtraction. Either this vector, or the new one.
   */
  sub(vct) {
    return this.subXY(vct.x, vct.y);
  }
  /**
   * Subtracts an x- and y-value from this vector.
   * @param {float} x X-value to subtract.
   * @param {float} y Y-value to subtract.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the subtraction. Either this vector, or the new one.
   */
  subXY(x, y) {
    return this.addXY(-x, -y);
  }
  /**
   * Scales this vector by an amount.
   * @param {float} amt Amount to scale by. For example, 2 would make the vector twice as long.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the scaling. Either this vector, or the new one.
   */
  scale(amt) {
    return this.scaleAsymmetrical(amt, amt);
  }
  /**
   * Scales this vector by an amount, using different amounts for the x- and y-direction.
   * @param {float} amtX Amount to scale the X-coordinate by. For example, 2 would make the vector twice as wide.
   * @param {float} amtY Amount to scale the Y-coordinate by. For example, 3 would make the vector three times as tall.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the scaling. Either this vector, or the new one.
   */
  scaleAsymmetrical(amtX, amtY) {
    return new Vector(this.#x * amtX, this.#y * amtY);
  }
  /** The angle in degrees this vector makes with the positive x-axis. */
  get angle() {
    return (this.angleRad * 180) / Math.PI;
  }
  /** The angle in radians this vector makes with the positive x-axis. */
  get angleRad() {
    return this.#x == 0 && this.#y == 0 ? 0 : Math.atan2(this.#y, this.#x);
  }
  /**
   * Returns the unit vector of this vector, i.e. this vector scaled by 1/magnitude.
   * @param {boolean} [mutate=false]  Whether or not to change this vector's values.
   * @returns The result of the scaling. Either this vector, or the new one.
   */
  normalise() {
    return this.scale(1 / this.magnitude);
  }
  /**
   * Rotates a vector around an angle, anticlockwise.
   * @param {number} angle Angle in degrees to rotate the vector.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The new rotated vector.
   */
  rotate(angle) {
    return this.rotateRad((angle / 180) * Math.PI);
  }
  /**
   * Rotates a vector around an angle, anticlockwise.
   * @param {number} angle Angle in radians to rotate the vector.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The new rotated vector.
   */
  rotateRad(angle) {
    return new Vector(
      this.#x * Math.cos(angle) - this.#y * Math.sin(angle),
      this.#y * Math.cos(angle) + this.#x * Math.sin(angle)
    );
  }
  /**
   * Finds the distance between this vector and another.
   * @param {Vector} vct The other vector to get the distance to.
   * @returns The Euclidean distance from this vector to the other one.
   */
  distanceTo(vct) {
    return this.sub(vct).magnitude;
  }
  /**
   * Finds the distance between this vector and a position.
   * @param {Vector} vct The other vector to get the distance to.
   * @returns The Euclidean distance from this vector to the other one.
   */
  distanceToXY(x, y) {
    return this.subXY(x, y).magnitude;
  }
  /**Creates a vector from an angle *in degrees* */
  static fromAngle(angle) {
    return new DirectionVector(angle);
  }
  /**Creates a vector from an angle *in radians* */
  static fromAngleRad(angle) {
    return new DirectionVector(angle, 1, true);
  }

  /** Returns a p5.Vector object equivalent to this vector.\
   * Use this class instead of p5.Vector whenever possible.
   */
  toP5() {
    return new p5.Vector(this.#x, this.#y);
  }
  /**
   * Creates a vector from a p5.Vector object.\
   * Work with this class, not p5.Vector when possible.\
   * Will not retain 3D values.
   * @param {p5.Vector} vct P5.Vector object to convert.
   * @returns A new Vector equivalent to the p5 vector.
   */
  static fromP5(vct) {
    return new this(vct.x, vct.y);
  }
  /**
   * Creates a vector from a single scalar.\
   * The X and Y values will both equal this number.
   * @param {number} size Size of each value.
   * @returns A new Vector(size, size).
   */
  static fromScalar(size) {
    return new this(size, size);
  }
  /**
   * Creates a clone of this vector.
   * @returns A different vector with the same value.
   */
  clone() {
    return new Vector(this.#x, this.#y);
  }
  /**Returns this vector's equivalent direction vector. */
  toDirectional() {
    return new DirectionVector(this.angleRad, this.magnitude, true);
  }
  /**@param {Vector} other */
  lerp(other, factor) {
    return new Vector(
      other.x * factor + this.#x * (1 - factor),
      other.y * factor + this.#y * (1 - factor)
    );
  }
  multiLerp(other, divisions) {
    let a = [];
    for (let i = 0; i <= 1; i += 1 / divisions) {
      a.push(this.lerp(other, i));
    }
    return a;
  }
  directionTo(x, y) {
    return this.subXY(x, y).toDirectional().reversed();
  }
}
/**Immutable direction vector. Stores direction and magnitude, rather than x and y values. */
class DirectionVector extends Vector {
  get angle() {
    return (this.angleRad / Math.PI) * 180;
  }
  angleRad = 0;
  magnitude = 1;
  get x() {
    return Math.cos(this.angleRad) * this.magnitude;
  }
  get y() {
    return Math.sin(this.angleRad) * this.magnitude;
  }
  constructor(direction, magnitude = 1, isRadian = false) {
    super();
    this.angleRad = isRadian ? direction : (direction / 180) * Math.PI;
    this.angleRad %= Math.PI * 2;
    this.magnitude = magnitude;
    delete this.toDirectional;
  }
  addXY(x, y) {
    return new Vector(x + this.x, y + this.y);
  }
  scale(amt) {
    return new DirectionVector(this.angleRad, this.magnitude * amt, true);
  }
  /**
   * Scales this vector by an amount, using different amounts for the x- and y-direction.
   * @param {float} amtX Amount to scale the X-coordinate by. For example, 2 would make the vector twice as wide.
   * @param {float} amtY Amount to scale the Y-coordinate by. For example, 3 would make the vector three times as tall.
   * @param {boolean} mutate Whether or not to change this vector's values.
   * @returns The result of the scaling. Either this vector, or the new one.
   */
  scaleAsymmetrical(amtX, amtY) {
    return new Vector(this.x * amtX, this.y * amtY);
  }
  rotate(angle) {
    return new DirectionVector(this.angle + angle, this.magnitude);
  }
  rotateRad(angle) {
    return new DirectionVector(this.angleRad + angle, this.magnitude, true);
  }
  reversed() {
    return new DirectionVector(this.angleRad + Math.PI, this.magnitude, true);
  }
  clone() {
    return new DirectionVector(this.angleRad, this.magnitude, true);
  }
  /**Returns this vector's equivalent positional vector. */
  toPositional() {
    return new Vector(this.x, this.y);
  }
  toP5() {
    return new p5.Vector(this.x, this.y);
  }
}

class Orientation {
  static ZERO = new Orientation(0, 0, 0, 0);
  x;
  y;
  rotation;
  slide;
  get pos() {
    return new Vector(this.x, this.y);
  }
  set pos(_) {
    this.x = _.x;
    this.y = _.y;
  }
  constructor(x = 0, y = 0, rot = 0, slide = 0) {
    this.x = x;
    this.y = y;
    this.rotation = rot;
    this.slide = slide;
  }
  addParts(x = 0, y = 0, rot = 0, slide = 0) {
    return new Orientation(this.x + x, this.y + y, this.rotation + rot, this.slide + slide);
  }
  clone() {
    return new Orientation(this.x, this.y, this.rotation, this.slide);
  }
  /**@param {Orientation} orientation  */
  add(orientation) {
    return this.addParts(orientation.x, orientation.y, orientation.rotation, orientation.slide);
  }
  rotate(angle) {
    let p = this.pos.rotate(angle);
    return new Orientation(p.x, p.y, this.rotation + angle, this.slide);
  }
}

function turn(direction, x, y, toX, toY, amount) {
  let delta = new Vector(toX - x, toY - y);
  //Define variables
  let currentDirection = Vector.fromAngle(direction).angle; //Find current angle, standardised
  let targetDirection = delta.angle; //Find target angle, standardised
  if (targetDirection === currentDirection) return { direction: direction, done: true }; //Do nothing if facing the right way
  let deltaRot = targetDirection - currentDirection;
  //Rotation correction
  if (deltaRot < -180) {
    deltaRot += 360;
  } else if (deltaRot > 180) {
    deltaRot -= 360;
  }
  let sign = deltaRot < 0 ? -1 : 1; //Get sign: -1 if negative, 1 if positive
  let deltaD = 0;
  let done = false;
  //Choose smaller turn
  if (Math.abs(deltaRot) > amount) {
    deltaD = amount * sign;
    done = true;
  } else {
    deltaD = deltaRot;
    done = false;
  }
  //Turn
  return { direction: direction + deltaD, done: done };
}
