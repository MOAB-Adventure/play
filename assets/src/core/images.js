class MAImageHandler {
  /**@type {Registry?} */
  images = null;
  draw(img = "error", x, y, width, height, angle, ...otherParameters) {
    push(); //Save current position, rotation, etc
    if (angle) {
      translate(x, y); //Move middle to 0,0
      rotate(angle);
      this.draw(img, 0, 0, width, height, 0, ...otherParameters);
    } else {
      noSmooth();
      //Get from registry if it exists
      img = this.images.has(img) ? this.images.get(img) : img;
      if (img instanceof ImageContainer) {
        if (!img.image) return; //Cancel if no image loaded yet
        image(img.image, x, y, width, height, ...otherParameters);
      } else {
        //Try to draw it directly if not
        try {
          image(img, x, y, width, height, ...otherParameters);
        } catch (error) {
          //Replace with a working image, unless its an error
          if (img !== "error") this.draw("error", x, y, width, height, angle, ...otherParameters);
        }
      }
    }
    pop(); //Return to old state
  }
  commit() {
    this.images = new Registry();
    Registry.images.forEach((i, n) => this.images.add(n, new ImageContainer(i.path)));
    console.log(` - Prepared ${this.images.size} images for loading.`);
  }
  async load() {
    let i = 0;
    const mi = this.images.size;
    await this.images.forEachAsync(async (item, name) => {
      if (await item.load()) i++;
    });
    console.log(` - Loaded ${i}/${mi} images.`);
  }
}

const ImageCTX = new MAImageHandler();

function drawImg(
  img = "error",
  x,
  y,
  width,
  height,
  ...otherParameters //IDK what else p5 image takes
) {
  ImageCTX.draw(img, x, y, width, height, 0, ...otherParameters);
  console.warn("Use of deprecated 'drawImg'");
}

function rotatedImg(img = "error", x, y, width, height, angle, ...otherParameters) {
  ImageCTX.draw(img, x, y, width, height, angle, ...otherParameters);
  console.warn("Use of deprecated 'rotatedImg'");
}
class ImageContainer {
  #image;
  #path;
  constructor(path) {
    this.#path = path;
    this.#image = null;
  }
  update(image) {
    this.#image = image;
  }
  async load() {
    try {
      this.#image = await loadImage(this.#path);
      console.debug(" - Loaded image from " + this.#path);
      return true;
    } catch (e) {
      console.error(" - Could not load image: ", e);
      return false;
    }
  }
  get image() {
    return this.#image;
  }
}
