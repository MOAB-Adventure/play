class UserInterfaceController {
  static Camera = class Camera {
    x = 960;
    y = 540;
    rotation = 0;
    zoom = 1;
  };
  static Mouse = class Mouse {
    /**@type {UserInterfaceController} */
    #ui;
    constructor(ui) {
      this.#ui = ui;
    }
    get x() {
      return (this.#ui.mobile ? this.#ui.#currentmobilemouse?.x : mouseX) / contentScale;
    }
    get y() {
      return (this.#ui.mobile ? this.#ui.#currentmobilemouse?.y : mouseY) / contentScale;
    }
    get down() {
      return this.#ui.mobile ? !!this.#ui.#currentmobilemouse : mouseIsPressed;
    }
  };
  set menuState(_) {
    this.#ms = _;
    this.components.forEach(x => x.updateActivity());
  }
  get menuState() {
    return this.#ms;
  }
  #ms = "title";
  waitingForMouseUp = false;
  timer = new Timer();
  camera = new UserInterfaceController.Camera();
  mouse = new UserInterfaceController.Mouse(this);
  get firing() {
    return this.mobile ? this.#mobileFire : this.mouse.down;
  }
  get target() {
    if (this.mobile) {
      let t = this.#currentmobiletarget ?? this.#lastmobiletarget;
      return { x: t.x / contentScale, y: t.y / contentScale };
    }
    return this.mouse;
  }
  #lastmobiletarget = { x: 0, y: 0 };
  #currentmobiletarget = { x: 0, y: 0 };
  #currentmobilemouse = { x: 0, y: 0 };
  #mobileFire = false;
  mobile = false;
  /**@type {Vector[]} */
  get touches() {
    return touches ?? [];
  }
  findNonUITouch() {
    let t = this.touches.find(v => v && this.components.every(c => !c.active || !c.touching(v)));
    if (this.mouse.down) this.#mobileFire = !!t;
    return t;
  }
  findUITouch() {
    let t = this.touches.find(v => v && this.components.some(c => c.active && c.touching(v)));
    return t;
  }
  conditions = {};
  get components() {
    return this.screens[this.menuState] ?? [];
  }
  addTo(component, ...screens) {
    screens.forEach(s => {
      this.screens[s] ??= [];
      this.screens[s].push(component);
    });
  }
  /**@type {Object.<string, UIComponent[]>} */
  screens = { title: [] };
  //Volume percentage
  volume = 50;
  //Percentages for different parts
  //Multiplicative with `volume`
  piecewiseVolume = { music: 100, weapons: 100, entities: 100, other: 100 };
  //particle
  particles = [];
  keybinds = new KeybindHandler();
  /** Handles UI keytype events. Returns true if something happened. */
  type(key) {
    return false;
  }
  tick() {
    this.timer.tick();
    const cs = this.components;
    for (let c = cs.length - 1; c >= 0; c--) {
      const component = cs[c];
      if (!cs) continue;

      component.updateActivity();
      if (component.active && component.isInteractive) {
        component.checkMouse(ui.mouse);
      }
    }
    let len = this.particles.length;
    for (let p = 0; p < len; p++) {
      if (this.particles[p]?.remove) {
        this.particles.splice(p, 1);
      }
    }
    if (this.mobile) {
      if (this.#currentmobiletarget) this.#lastmobiletarget = this.#currentmobiletarget;
      this.#currentmobiletarget = this.findNonUITouch();
      this.#currentmobilemouse = this.findUITouch() ?? this.#currentmobiletarget;
    }
    this.keybinds.tick();
  }
  revaluate(text) {
    return text
      .replaceAll(/\{\{[^\{\}]*\}\}/g, m => getKeyDesc(m.substring(2, m.length - 2)))
      .replaceAll(/\[\[[^\[\]]*\]\]/g, m => UIComponent.getCondition(m.substring(2, m.length - 2)));
  }
}

const ui = new UserInterfaceController();

class UIComponent {
  static setKeyboardShortcut(uicomponent, shortcut) {
    uicomponent.shortcutKey = shortcut;
    return uicomponent;
  }
  static invert(uicomponent) {
    uicomponent.inverted = true;
    uicomponent.y *= -1;
    return uicomponent;
  }
  static setBackgroundOf(uicomponent, colour = null) {
    if (typeof colour === "string") uicomponent.bgimg = colour;
    else uicomponent.backgroundColour = colour;
    return uicomponent;
  }
  static removeOutline(uicomponent) {
    uicomponent.outline = false;
    return uicomponent;
  }
  static setOutlineColour(uicomponent, colour = null) {
    uicomponent.outlineColour = colour;
    uicomponent.baseOutlineColour = colour;
    return uicomponent;
  }
  static alignRight(uicomponent) {
    uicomponent.ox = uicomponent.x; //Save old x
    Object.defineProperty(uicomponent, "x", {
      get: () => uicomponent.ox - textWidth(uicomponent.text) / 2, //Add width to it
    });
    return uicomponent;
  }
  static alignLeft(uicomponent) {
    uicomponent.ox = uicomponent.x; //Save old x
    Object.defineProperty(uicomponent, "x", {
      get: () => {
        textFont(fonts.ocr);
        return uicomponent.ox + textWidth(uicomponent.text) / 2;
      }, //Add width to it
    });
    return uicomponent;
  }
  //Evaluates property:value on game ui: input "slot:1" => if "slot" is "1" (or equivalent, e.g. 1) return true, else false
  static evaluateCondition(condition) {
    const parts = condition.split(":"); //Separate property <- : -> value
    if (parts.length === 1) return condition in ui.conditions;
    if (parts.length !== 2) {
      //If extra parameters, or not enough:
      return true; //Basically ignore
    }
    if (ui.conditions[parts[0]]) {
      //Separate property values
      let values = parts[1].split("|");
      //If property exists
      return values.includes(ui.conditions[parts[0]]); //Check it and return
    }
    return true; //If unsure, ignore
  }
  //Gets the value of a condition
  static getCondition(condition) {
    return ui.conditions[condition] ?? ""; //Check it and return
  }
  //Sets property:value on game ui: input "slot:1" => sets "slot" to "1"
  static setCondition(condition) {
    const parts = condition.split(":"); //Separate property <- : -> value
    if (parts.length !== 2) {
      //If extra parameters
      return; //Cancel
    }
    ui.conditions[parts[0]] = parts[1]; //Set the property
  }
  conditions = [];
  interactive = false;
  isBackButton = false;
  active = false;
  inverted = false;
  outline = true;
  backgroundColour = null;
  textColour = col.black;
  special = false;
  bgimg = null;
  updateActivity() {
    //It's active if it should show *and* all the conditions are met
    this.active = this.getActivity();
  }
  getActivity() {
    if (this.conditions[0] === "any") {
      return this.getActivityAnyCondition();
    }
    for (let condition of this.conditions) {
      //Short-circuiting: if one returns false, don't even bother checking the others, it's not active.
      if (!UIComponent.evaluateCondition(condition)) return false;
    }
    return true;
  }
  getActivityAnyCondition() {
    for (let condition of this.conditions) {
      if (condition === "any") continue;
      //Short-circuiting: if one returns true, don't even bother checking the others, it's active.
      if (UIComponent.evaluateCondition(condition)) return true;
    }
    return false;
  }
  #txtinited = false;
  constructor(x = 0, y = 0, width = 1, height = 1, bevel = "none", onpress = () => {}, shownText = "", useOCR = false, shownTextSize = 20) {
    //Initialise component
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.outlineColour = col.mono(50);
    this.baseOutlineColour = this.outlineColour;
    this.emphasisColour = col.red | col.green;
    this.emphasised = false;
    this.ocr = useOCR;
    this.text = shownText;
    this.textSize = shownTextSize;
    this.bevel = bevel;
    this.press = onpress;
    this.interactive = !!onpress;
  }
  draw() {
    if (!this.#txtinited) {
      this.#txtinited = true;
      let processed;
      if (!this.text.startsWith("*")) {
        let c = 1;
        if (this.width > 0) {
          textFont(this.ocr ? fonts.ocr : fonts.darktech);
          textSize(this.textSize);
          let singleCharWidth = textWidth("-");
          // console.log(
          //   `test char width: ${singleCharWidth} (charsize ${this.textSize}, font ${
          //     this.ocr ? "ocr" : "darktech"
          //   })`
          // );
          while (singleCharWidth * c <= this.width) c++;
          // console.log(`${c} max chars for width ${this.width}`);
        } else c = 100001;
        c -= 2;
        processed = wrapWords(this.text, c);
        // console.log(`raw:\n${this.text}\nprocessed text:\n${processed}`);
      } else processed = this.text.substring(1);
      if (Object.getOwnPropertyDescriptor(this, "text").writable) this.text = processed;
    }
    push();
    noStroke();
    if (this.inverted) scale(1, -1);
    if (this.width > 0 && this.height > 0) {
      if (this.outline && this.outlineColour) {
        col.fill(this.outlineColour);
        if (this.emphasised) {
          if (this.special) {
            fillGradient("linear", {
              from: [this.x, this.y],
              to: [this.x + this.width / 2, this.y + this.height / 2],
              steps: [color(0, 255, 255), color(0, 96, 164), color(0)],
            });
          } else col.fill(this.emphasisColour);
        }
        push();
        if (this.bevel !== "none") {
          beginClip({ invert: true });
          //Cut out triangle from the right of the outline
          if (this.bevel === "right" || this.bevel === "both") {
            triangle(
              this.x + (this.width + 20) / 2 - this.height,
              this.y + (this.height + 20) / 2,
              this.x + (this.width + 20) / 2 + 20,
              this.y - (this.height + 20) / 2,
              this.x + (this.width + 20) / 2 + 20,
              this.y + (this.height + 20) / 2,
            );
          }
          //Cut out triangle from the left of the outline
          if (this.bevel === "left" || this.bevel === "both") {
            triangle(
              this.x - (this.width + 20) / 2 + this.height,
              this.y - (this.height + 20) / 2,
              this.x - (this.width + 20) / 2 - 20,
              this.y + (this.height + 20) / 2,
              this.x - (this.width + 20) / 2 - 20,
              this.y - (this.height + 20) / 2,
            );
          }
          endClip();
        }
        //Draw outline behind background

        rect(
          this.x
            + (this.bevel === "right" ? 10
            : this.bevel === "left" ? -10
            : 0),
          this.y,
          this.width
            + (this.bevel === "right" || this.bevel === "left" ? 38
            : this.bevel === "both" ? 56
            : 18)
            - 2,
          this.height + 18,
        );
        pop();
      }
      push();
      translate(0, 0, 1);
      //Add bevels
      if (this.bevel !== "none") {
        beginClip({ invert: true });
        //Cut out triangle from the right of the background
        if (this.bevel === "right" || this.bevel === "both") {
          triangle(
            this.x + this.width / 2 - this.height,
            this.y + this.height / 2,
            this.x + this.width / 2,
            this.y - this.height / 2,
            this.x + this.width / 2,
            this.y + this.height / 2,
          );
        }
        //Cut out triangle from the left of the background
        if (this.bevel === "left" || this.bevel === "both") {
          triangle(
            this.x - this.width / 2 + this.height,
            this.y - this.height / 2,
            this.x - this.width / 2,
            this.y + this.height / 2,
            this.x - this.width / 2,
            this.y - this.height / 2,
          );
        }
        endClip();
      }
      //Draw BG
      if (this.backgroundColour !== null) {
        col.fill(this.backgroundColour);
        rect(this.x, this.y, this.width - 2, this.height - 2);
      } else {
        ImageCTX.draw(this.bgimg ?? "ui.background", this.x, this.y, this.width - 2, this.height - 2, 0, 0, 0, this.width - 2, this.height - 2);
      }
      pop();
    }
    //Draw optional text
    translate(0, 0, 2);
    noStroke();
    textFont(this.ocr ? fonts.ocr : fonts.darktech);
    col.fill(this.textColour);
    textAlign(CENTER, CENTER);
    if (this.ocr) {
      stroke(0);
      strokeWeight(this.textSize / 15);
    }
    textSize(this.textSize);
    text(ui.revaluate(this.text), this.x, this.y);
    pop();
  }
  /**@param {Vector} point */
  touching(point) {
    return (
      point.x < this.x + this.width / 2
      && point.x > this.x - this.width / 2
      && point.y < this.y + this.height / 2
      && point.y > this.y - this.height / 2
    );
  }
  /**@param {typeof UserInterfaceController.prototype.mouse} mouse  */
  checkMouse(mouse) {
    // If the mouse is colliding with the button
    if (this.touching(mouse)) {
      //And mouse is down
      if (mouse.down) {
        this.outlineColour = col.green | col.blue;
        //And the UI isn't waiting
        if (!ui.waitingForMouseUp) {
          //Click
          this.press();
          //And make the UI wait
          ui.waitingForMouseUp = true;
        }
      } else {
        this.outlineColour = col.from(0, 128, 128);
      }
    } else {
      this.outlineColour = this.baseOutlineColour;
    }
  }
}

function getKeyDesc(naem) {
  return ui.keybinds.describe(naem) ?? game.keybinds.describe(naem) ?? "None";
}

class CustomDrawerComponent extends UIComponent {
  drawer;
  constructor(x = 0, y = 0, width = 1, height = 1, draw = (x, y) => {}, onpress = () => {}) {
    //Initialise component
    super(x, y, width, height, "none", onpress);
    this.drawer = draw;
  }
  draw() {
    this.drawer(this.x, this.y);
  }
}

class ImageUIComponent extends UIComponent {
  angle = 0;
  opacity = 1;
  constructor(x = 0, y = 0, width = 1, height = 1, shownImage = null, onpress = () => {}, outline = true) {
    //Initialise component
    super(x, y, width, height, "none", onpress, "", false, 0);
    this.image = shownImage;
    this.outline = outline;
  }
  draw() {
    push();
    col.fill(this.outlineColour);
    if (this.emphasised) col.fill(this.emphasisColour);
    //Draw outline behind background
    if (this.outline) rect(this.x, this.y, this.width + 18, this.height + 18);
    if (this.opacity !== 1) tint(255, 255 * this.opacity);
    //Draw image
    ImageCTX.draw(this.image, this.x, this.y, this.width - 2, this.height - 2, this.angle);
    pop();
  }
}
class ShapeUIComponent extends UIComponent {
  angle = 0;
  shape = "rect";
  backgroundColour = col.mono(100);
  outlineWidth = 10;
  constructor(x = 0, y = 0, width = 1, height = 1, drawnShape = null, onpress = () => {}, outline = true) {
    //Initialise component
    super(x, y, width, height, "none", onpress, "", false, 0);
    this.shape = drawnShape;
    this.outline = outline;
  }
  draw() {
    push();
    if (this.outline) {
      if (this.emphasised) col.stroke(this.emphasisColour);
      else col.stroke(this.outlineColour);
      strokeWeight(this.outlineWidth);
    } else noStroke();
    col.fill(this.backgroundColour);
    //Draw image
    rotatedShape(this.shape, this.x, this.y, this.width - 2, this.height - 2, this.angle);
    pop();
  }
}

class HealthbarComponent extends UIComponent {
  /**@type {Entity?} */
  source = null;
  healthbarColour = col.white;
  isHigher = () => false;
  backgroundColour = col.black;
  healthbarReversed = false;
  fracReversed = false;
  sourceIsFunction = false;
  textColour = this.outlineColour;
  #current = "health";
  #max = "maxHealth";
  #frac = 0;
  #painColour = -1;
  setIsHigher(f = () => false) {
    this.isHigher = f;
    return this;
  }
  // setGradient(...colours) {
  //   let x = this.x - (this.healthbarReversed ? -this.width / 2 : this.width / 2);
  //   this.gradient = {
  //     from: [x, this.y],
  //     to: [x + this.width / 1.25, this.y + this.height / 2],
  //     steps: colours,
  //   };
  // }
  // clearGradient() {
  //   this.gradient = null;
  // }
  setGetters(current = "health", max = "maxHealth") {
    this.#current = current;
    this.#max = max;
    return this;
  }
  reverseBarDirection() {
    this.healthbarReversed = !this.healthbarReversed;
    return this;
  }
  reverseBarFraction() {
    this.fracReversed = !this.fracReversed;
    return this;
  }
  setColours(bg, main, pain) {
    if (bg) this.backgroundColour = bg;
    if (main) this.healthbarColour = main;
    if (pain) this.#painColour = pain;
    return this;
  }
  constructor(
    x = 0,
    y = 0,
    width = 1,
    height = 1,
    bevel = "none",
    onpress = () => {},
    shownText = "",
    useOCR = false,
    shownTextSize = 20,
    source = null,
    healthcol = col.red | col.green,
  ) {
    //Initialise component
    super(x, y, width, height, bevel, onpress, shownText, useOCR, shownTextSize);
    this.source = source;
    this.sourceIsFunction = typeof this.source === "function";
    this.healthbarColour = healthcol;
    this.#painColour = col.lighten(healthcol, 220);
  }
  /**@returns {Entity?} */
  getSource() {
    return this.sourceIsFunction ? this.source() : this.source;
  }
  draw() {
    let src = this.getSource();
    //tick
    let fr = src[this.#current] / src[this.#max];

    let target = src ? this.width * (this.fracReversed ? 1 - fr : fr) : 0;
    this.#frac += (target - this.#frac) * 0.075;

    let bgc = (typeof this.backgroundColour === "function" ? this.backgroundColour() : this.backgroundColour) ?? col.from(95, 100, 100, 160);
    let pc = typeof this.#painColour === "function" ? this.#painColour() : this.#painColour;
    let hbc = typeof this.healthbarColour === "function" ? this.healthbarColour() : this.healthbarColour;

    push();
    translate(this.x, this.y, 9);
    rotate(this.rotation);
    translate(-this.x, -this.y);
    noStroke();
    push();
    if (this.inverted) scale(1, -1);
    if (this.invertedX) scale(-1, 1);
    if (this.width > 0 && this.height > 0) {
      //outline
      if (this.outline && this.outlineColour) {
        col.stroke(this.outlineColour);
        strokeWeight(20);
        if (this.emphasised) col.stroke(this.emphasisColour);
        noFill();
        this.#shape(
          this.x - (this.healthbarReversed ? -this.width / 2 : this.width / 2),
          this.y,
          this.width,
          this.height,
          true,
          false,
          this.healthbarReversed,
        );
      }
      //bar
      noStroke();
      col.fill(bgc);
      this.#shape(
        this.x - (this.healthbarReversed ? -this.width / 2 : this.width / 2),
        this.y,
        this.width,
        this.height,
        true,
        false,
        this.healthbarReversed,
      );
      //indicator
      col.fill(pc);
      this.#shape(
        this.x - (this.healthbarReversed ? -this.width / 2 : this.width / 2),
        this.y,
        this.#frac,
        this.height,
        true,
        false,
        this.healthbarReversed,
        true,
      );
      //health

      if (this.isHigher()) {
        fillGradient("linear", {
          from: [this.x - this.width / 2, this.y - this.height / 2],
          to: [this.x + this.width / 2, this.y + this.height / 2],
          steps: [[color(...hbc.map(x => x + 200)), 0.3], color(...hbc), [color(0), 0.8]],
        });
      } else col.fill(hbc);
      this.#shape(
        this.x - (this.healthbarReversed ? -this.width / 2 : this.width / 2),
        this.y,
        target,
        this.height,
        true,
        false,
        this.healthbarReversed,
        true,
      );
    }
    pop();
    //Draw optional text
    if (this.text) {
      noStroke();
      textFont(this.ocr ? fonts.ocr : fonts.darktech);
      if (this.ocr) {
        col.stroke(this.textColour);
        strokeWeight(this.textSize / 15);
      }
      col.fill(this.textColour);
      textAlign(LEFT, CENTER);
      textSize(this.textSize);
      text(" " + (src ? this.text : "No source"), (this.x - this.width / 2) * (this.invertedX ? -1 : 1), this.y * (this.inverted ? -1 : 1));
    }
    pop();
  }
  #shape(x, y, width, height, realign = false, realignV = false, reverseX = false, constrain = false) {
    if (realign) x += (width / 2) * (reverseX ? -1 : 1);
    if (realignV) y += height / 2;
    beginShape(QUADS);
    if (this.bevel === "none") {
      v(x - width / 2, y + height / 2);
      v(x + width / 2, y + height / 2);
      v(x + width / 2, y - height / 2);
      v(x - width / 2, y - height / 2);
    } else if (this.bevel === "both") {
      v(x - width / 2 - height / 2, y + height / 2);
      v(x + width / 2 - height / 2, y + height / 2);
      v(x + width / 2 + height / 2, y - height / 2);
      v(x - width / 2 + height / 2, y - height / 2);
    } else if (this.bevel === "trapezium") {
      v(x - width / 2 - height / 2, y + height / 2);
      v(x + width / 2 + height / 2, y + height / 2);
      v(x + width / 2 - height / 2, y - height / 2);
      v(x - width / 2 + height / 2, y - height / 2);
    } else if (this.bevel === "right") {
      v(x - width / 2, y + height / 2);
      v(x + width / 2, y + height / 2);
      v(x + width / 2 + height, y - height / 2);
      v(x - width / 2, y - height / 2);
    } else if (this.bevel === "left") {
      v(x - width / 2 - height, y + height / 2);
      v(x + width / 2, y + height / 2);
      v(x + width / 2, y - height / 2);
      v(x - width / 2, y - height / 2);
    } else if (this.bevel === "reverse") {
      v(x - width / 2 + height / 2, y + height / 2);
      v(x + width / 2 + height / 2, y + height / 2);
      v(x + width / 2 - height / 2, y - height / 2);
      v(x - width / 2 - height / 2, y - height / 2);
    }
    endShape(CLOSE);
  }
}
function v(x, y) {
  // if (max && x > max) {
  //   y -= max - x;
  //   x = max;
  // }
  // if (min && x < min) {
  //   y += x - min;
  //   x = min;
  // }
  vertex(x, y);
}
function createHealthbarComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  bevel = "none",
  onpress = () => {},
  shownText = "",
  useOCR = false,
  shownTextSize = 20,
  source = null,
  healthcol = col.red | col.green,
) {
  //Make component
  const component = new HealthbarComponent(x, y, width, height, bevel, onpress, shownText, useOCR, shownTextSize, source, healthcol);
  component.conditions = conditions;
  //Set conditional things
  component.isInteractive = !!onpress;
  //Add to game
  ui.addTo(component, ...screens);
  return component;
}

function rotatedShape(shape = "circle", x, y, width, height, angle) {
  push(); //Save current position, rotation, etc
  translate(x, y); //Move middle to 0,0
  rotate(angle);
  switch (shape) {
    case "circle":
      circle(0, 0, (width + height) / 2);
      break;
    case "square":
      square(0, 0, (width + height) / 2);
      break;
    case "ellipse":
      ellipse(0, 0, width, height);
      break;
    case "rect":
      rect(0, 0, width, height);
      break;
    case "triangle":
      triangle(-width / 2, height / 2, -width / 2, -height / 2, width / 2, 0);
      break;
    case "moved-triangle":
      triangle(0, height / 2, 0, -height / 2, width, 0);
      break;
    case "moved-back-triangle":
      triangle(-width, height / 2, -width, -height / 2, 0, 0);
      break;
    case "rhombus":
      scale(width, height); //Change the size
      rotate(QUARTER_PI); //turn it
      square(0, 0, 1); //make a square
      scale(1, 1); //scale back
      rotate(-QUARTER_PI); //turn back
      break;
    default:
      break;
  }
  pop(); //Return to old state
}

class SliderUIComponent extends UIComponent {
  _current = 0;
  constructor(
    x = 0,
    y = 0,
    width = 1,
    sliderLength = 1,
    height = 1,
    bevel = "none",
    shownText = "",
    useOCR = false,
    shownTextSize = 20,
    onchange = value => {},
    min = 0,
    max = 100,
    current = null,
  ) {
    super(x, y, width, height, bevel, undefined, shownText, useOCR, shownTextSize);
    //Change callback
    this.change = onchange;
    this.length = sliderLength;
    this.min = min;
    this._current = current ?? (min + max) / 2;
    this.max = max;
  }
  draw() {
    push();
    //Outline
    col.fill(this.outlineColour);
    rect(this.x + (this.width + this.length) / 2 - this.height / 2, this.y, this.length + this.height + 18, this.height / 2 + 18);
    //Empty bit
    fill(0);
    rect(this.x + (this.width + this.length) / 2 - this.height / 2, this.y, this.length + this.height - 2, this.height / 2 - 2);
    //Full bit
    fill(255, 255, 0);
    //Get minimum X
    let minX = this.x + this.width / 2;
    //Calculate width of bar
    let w = (this._current / this.max) * this.length + this.height / 2;
    //Draw full bit
    rect(minX + w / 2 - this.height / 2, this.y, w, this.height / 2);
    //Draw the title bit
    this.x += 25;
    super.draw();
    this.x -= 25;
    pop();
  }
  checkMouse(mouse) {
    //Set min/max x positions
    let minX = this.x + this.width / 2,
      maxX = this.x + this.width / 2 + this.length;
    // If the mouse is colliding with the button
    if (mouse.x < maxX && mouse.x > minX && mouse.y < this.y + this.height / 2 && mouse.y > this.y - this.height / 2) {
      //And mouse is down
      if (mouse.down) {
        // - But don't wait, so smooth movement

        this.outlineColour = col.green | col.blue;
        //Click and change values
        this._current = ((mouse.x - minX) / this.length) * this.max;
        this.change(this._current);
        //And make the UI wait
        ui.waitingForMouseUp = true;
      } else {
        this.outlineColour = col.from(0, 128, 128);
      }
    } else {
      this.outlineColour = col.mono(50);
    }
  }
}

function createUIComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  bevel = "none",
  onpress = null,
  shownText = "",
  useOCR = false,
  shownTextSize = 20,
) {
  //Make component
  const component = new UIComponent(x, y, width, height, bevel, onpress ?? (() => {}), shownText, useOCR, shownTextSize);
  component.conditions = conditions;
  //Set conditional things
  component.isInteractive = !!onpress;
  //Add to game
  ui.addTo(component, ...screens);
  return component;
}

function createCustomUIComponent(screens = [], conditions = [], x = 0, y = 0, width = 1, height = 1, draw = null, onpress = null) {
  //Make component
  const component = new CustomDrawerComponent(x, y, width, height, draw ?? (() => {}), onpress ?? (() => {}));
  component.conditions = conditions;
  //Set conditional things
  component.isInteractive = !!onpress;
  //Add to game
  ui.addTo(component, ...screens);
  return component;
}

function createUIImageComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  onpress = null,
  shownImage = null,
  outline = true,
) {
  //Make component
  const component = new ImageUIComponent(x, y, width, height, shownImage, onpress ?? (() => {}), outline);
  component.conditions = conditions;
  //Set conditional things
  component.isInteractive = !!onpress;
  //Add to game
  ui.addTo(component, ...screens);
  return component;
}
function createUIShapeComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  onpress = null,
  drawnShape = null,
  outline = true,
) {
  //Make component
  const component = new ShapeUIComponent(x, y, width, height, drawnShape, onpress ?? (() => {}), outline);
  component.conditions = conditions;
  //Set conditional things
  component.isInteractive = !!onpress;
  //Add to game
  ui.addTo(component, ...screens);
  return component;
}

function createGamePropertySelector(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  bufferWidth = 1,
  optionWidth = 1,
  height = 1,
  property = "",
  options = [""],
  /**@deprecated */
  defaultOption = null,
  shownTexts = [""],
  shownTextSize = 50,
  onchange = value => {},
  selectionColour = col.red | col.green,
  canPress = property => true,
  whenBad = property => {},
) {
  let parts = [];
  let display = property.split(/(?=[A-Z]+)/).join(" ");
  //Create display name
  createUIComponent(
    screens,
    conditions,
    x + display.length * shownTextSize * 0.375 + 50,
    y - 65,
    0,
    0,
    "none",
    undefined,
    display,
    false,
    shownTextSize * 0.8,
  );
  //Create indicator
  createUIComponent(screens, conditions, x + bufferWidth / 2, y, bufferWidth, height, "right", undefined, "> ", false, shownTextSize);
  let len = Math.min(options.length, shownTexts.length); //Get smallest array, don't use blanks
  for (let i = 0; i < len; i++) {
    //For each option or text
    //Make a selector option
    let component = createUIComponent(
      screens,
      conditions,
      x + bufferWidth + optionWidth * (i + 0.5),
      y,
      optionWidth,
      height,
      "both",
      () => {
        if (canPress(options[i])) {
          game[property] = options[i]; //Set the property
          onchange(options[i]);
        } else whenBad(options[i]);
      },
      shownTexts[i],
      true,
      shownTextSize,
    );
    //colour thing
    component.emphasisColour = selectionColour;

    //Highlight if the game has this option
    Object.defineProperty(component, "emphasised", { get: () => game[property] === options[i] });
    parts.push(component);
  }
  return parts;
}

function createSliderComponent(
  screens = [],
  conditions = [],
  x = 0,
  y = 0,
  width = 1,
  sliderLength = 100,
  height = 1,
  bevel = "none",
  shownText = "",
  useOCR = false,
  shownTextSize = 20,
  onchange = null,
  min = 0,
  max = 100,
  current = null,
) {
  //Make component
  const component = new SliderUIComponent(
    x,
    y,
    width,
    sliderLength,
    height,
    bevel,
    shownText,
    useOCR,
    shownTextSize,
    onchange ?? (() => {}),
    min,
    max,
    current,
  );
  component.conditions = conditions;
  //Set conditional things
  component.isInteractive = !!onchange;
  //Add to game
  ui.addTo(component, ...screens);
  return component;
}

function blendColours(col1, col2, col1Factor) {
  col1[3] ??= 255;
  col2[3] ??= 255;
  let col2Factor = 1 - col1Factor;
  let newCol1 = [col1[0] * col1Factor, col1[1] * col1Factor, col1[2] * col1Factor, col1[3] * col1Factor];
  let newCol2 = [col2[0] * col2Factor, col2[1] * col2Factor, col2[2] * col2Factor, col2[3] * col2Factor];
  let newCol = [newCol1[0] + newCol2[0], newCol1[1] + newCol2[1], newCol1[2] + newCol2[2], newCol1[3] + newCol2[3]];
  if (newCol[0] > 255) {
    newCol[0] = 255;
  }
  if (newCol[1] > 255) {
    newCol[1] = 255;
  }
  if (newCol[2] > 255) {
    newCol[2] = 255;
  }
  return newCol;
}

class UIParticleEmitter extends UIComponent {
  interval = 60;
  scale = 1;
  direction = 0;
  #countdown = 0;
  /**@type {string | VisualEffect} */
  effect = "none";
  draw() {
    if (this.#countdown <= 0) {
      this.#countdown = this.interval;
      if (this.effect !== "none") createEffect(this.effect, null, this.x, this.y, this.direction, this.scale);
    } else this.#countdown--;
  }
  checkMouse(mouse) {}
  constructor(x, y, direction, scale, effect, interval) {
    super(x, y, 0, 0, "none", () => null, "", false, 0);
    this.effect = effect;
    this.direction = direction;
    this.scale = scale;
    this.interval = interval;
  }
}

function createParticleEmitter(screens = [], conditions = [], x = 0, y = 0, direction = 0, scale = 1, effect = "none", interval = 1) {
  //Make component
  const component = new UIParticleEmitter(x, y, direction, scale, effect, interval);
  component.conditions = conditions;
  //add
  ui.addTo(component, ...screens);
  return component;
}

function uiBlindingFlash(x = 0, y = 0, opacity = 255, duration = 60, glareSize = 600) {
  if (!game.flashing) return;
  ui.particles.push(
    //Obscure screen
    new ShapeParticle(x, y, HALF_PI, 30, 0, 0, "ellipse", col.withA(col.white, opacity), col.withA(col.white, 0), 0, 1920 * 3, 0, 1080 * 3, 0),
    new ShapeParticle(x, y, HALF_PI, 90, 0, 0, "ellipse", col.withA(col.white, opacity), col.withA(col.white, 0), 0, 1920 * 5, 0, 1080 * 5, 0),
    new ShapeParticle(x, y, HALF_PI, 120, 0, 0, "ellipse", col.withA(col.white, opacity), col.withA(col.white, 0), 0, 1920 * 8, 0, 1080 * 8, 0),
    new ShapeParticle(
      960,
      540,
      HALF_PI,
      duration,
      0,
      0,
      "rect",
      col.withA(col.white, opacity),
      col.withA(col.white, 0),
      1920,
      1920,
      1080,
      1080,
      0,
      false,
    ),
    //Glare effect
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration * 0.5,
      0,
      0,
      "rhombus",
      col.withA(col.white, 150),
      col.withA(col.white, 0),
      glareSize / 3,
      glareSize * 2,
      glareSize / 5,
      0,
      0,
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration,
      0,
      0,
      "rhombus",
      col.withA(col.white, 200),
      col.withA(col.white, 0),
      glareSize / 6,
      glareSize * 1.5,
      (glareSize / 5) * 0.6,
      0,
      0,
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration * 1.5,
      0,
      0,
      "rhombus",
      col.white,
      col.withA(col.white, 0),
      glareSize / 9,
      glareSize,
      (glareSize / 5) * 0.3,
      0,
      0,
    ),
  );
}
