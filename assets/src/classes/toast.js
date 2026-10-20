const maxToastLineLength = 20;
class Toast {
  totalTime = 0;
  timeLeft = 0;
  /**
   * Make a toast. (i.e. popup notification)
   * You can only do this when p5 has already loaded.
   * @param {string} title Big text
   * @param {string} text Smaller subtext
   * @param {number} time How may frames this is out for (60fps)
   * @param {ToastStyle} styling What the toast looks like.
   */
  constructor(title = "Boo!", text = "You have a notification.", time = 240, styling = ToastStyle.plain) {
    this.title = wrapWords(title, maxToastLineLength);
    this.text = wrapWords(text, Math.ceil(maxToastLineLength * 1.33333333333));
    this.totalTime = this.timeLeft = time;
    this.style = styling;
    push();
    noStroke();
    textFont(fonts.ocr);
    textSize(40);
    this.titleWidth = textWidth(this.title);
    this.titleHeight = textHeight(this.title);
    textSize(30);
    this.textWidth = textWidth(this.text) + 20;
    this.textHeight = textHeight(this.text);
    pop();
  }
}

class ToastStyle {
  backgroundColour = col.mono(100);
  outlineColour = col.mono(50);
  outlineWidth = 8;
  subtextColour = col.mono(50);
  titleColour = col.mono(50);
  init() {
    this.backgroundColour = col.convert(this.backgroundColour);
    this.outlineColour = col.convert(this.outlineColour);
    this.subtextColour = col.convert(this.subtextColour);
    this.titleColour = col.convert(this.titleColour);
  }
  /**@readonly */
  static get plain() {
    return this.#pl;
  }
  static #pl = construct({ outlineWidth: 3 }, this);
  /**@readonly */
  static get progress() {
    return this.#pr;
  }
  static #pr = construct({ titleColour: [20, 160, 220] }, this);
  /**@readonly */
  static get achievement() {
    return this.#ac;
  }
  static #ac = construct({ titleColour: [140, 70, 200] }, this);
  /**@readonly */
  static get ending() {
    return this.#en;
  }
  static #en = construct({ titleColour: [200, 100, 30] }, this);
  /**@readonly */
  static get error() {
    return this.#er;
  }
  static #er = construct({ titleColour: [170, 40, 40] }, this);
}

/** Handles showing and arranging toasts. Will automatically delay toasts until p5 is up, so can be used at any point. */
class ToastManager {
  /**@type {Set<Toast>} */
  #active = new Set();
  #inactive = [];
  tick() {
    if ("push" in window && this.#inactive.length) {
      for (const toast of this.#inactive) this.#active.add(new Toast(...toast));
      this.#inactive = [];
    }
    for (const toast of this.#active) {
      if (toast.timeLeft > 1) toast.timeLeft--;
      else this.#active.delete(toast);
    }
    // this.active = this.active.filter(v => v.timeLeft > 1);
  }
  draw() {
    let offy = 200;
    for (const toast of this.#active) {
      let width = Math.max(toast.titleWidth, toast.textWidth),
        height = 20 + toast.textHeight + toast.titleHeight; //30 * toast.textLines + 40 * toast.titleLines;

      let opacity = 255 - 4 * Math.max(0, 64 - toast.timeLeft);
      let offx = Math.min(1, (toast.timeLeft - 32) / 32) + Math.min(1, (toast.totalTime - toast.timeLeft - 8) / 8) - 1;
      // console.log("width " + titlelen + " or " + textlen + ", chose " + width);
      // console.log("opacity " + opacity + ", off " + offx);
      push();
      textFont(fonts.ocr);
      col.fill(col.withA(toast.style.backgroundColour, opacity));
      col.stroke(col.withA(toast.style.outlineColour, opacity));
      strokeWeight(10);
      rect(1920 - offx * (width / 2 + 30), offy + height / 2, width + 60, height + 60);
      strokeWeight(toast.style.outlineWidth + 2);
      col.stroke(col.withA(toast.style.titleColour, opacity));
      rect(1920 - offx * (width / 2 + 30), offy + height / 2, width + 40, height + 40);
      strokeWeight(toast.style.outlineWidth);
      col.fill(col.withA(toast.style.outlineColour, opacity));
      textSize(40);
      textAlign(CENTER);
      text(toast.title, 1920 - offx * (width / 2 + 30), offy + 25);
      col.fill(col.withA(toast.style.subtextColour, opacity));
      noStroke();
      textSize(30);
      textAlign(LEFT, TOP);
      text(toast.text, 1920 - width / 2 - 10 - offx * (width / 2 + 30), offy + 10 + toast.titleHeight);
      pop();
      offy += (height + 60) * Math.max(offx, 0);
    }
  }
  show(title, text, time, style) {
    if ("push" in window) this.#active.add(new Toast(title, text, time, style));
    else this.#inactive.push([title, text, time, style]);
  }
}

const toasts = new ToastManager();
