// Fairly minimal 2-stage volume-controllable sound system

class SoundContainer {
  /** @type {AudioBuffer?} */
  #sound = null;
  /** @type {AudioBuffer?} */
  #loop = null;
  /** @type {"weapons" | "entities" | "music" | "other"} */
  #category = "none";
  #path;
  #loopPath;
  /**
   * @param {string} path
   * @param {"weapons" | "entities" | "music" | "other"} category
   */
  constructor(path, category = "none", loop = null) {
    this.#path = path;
    this.#category = category;
    this.#loopPath = loop;
  }
  async load(ctx) {
    this.#sound = await ctx.load(this.#path);
    if (this.#loopPath) this.#loop = await ctx.load(this.#loopPath);
    return this.#sound != null;
  }
  get sound() {
    return this.#sound;
  }
  get loop() {
    return this.#loop;
  }
  get category() {
    return this.#category;
  }
}

class MASoundEngine {
  context = new AudioContext();
  volume = this.context.createGain();
  piecewiseVolume = {
    weapons: this.context.createGain(),
    entities: this.context.createGain(),
    music: this.context.createGain(),
    other: this.context.createGain(),
    bypass: this.context.createGain(),
  };
  muffler = this.context.createBiquadFilter();
  // parallel channels
  unprocessed = this.context.createGain();
  processed = this.context.createGain();
  /**@type {Registry?} */
  sounds = null;
  // music
  /** @type {SoundContainer?} */
  #music = null;
  /** @type {AudioBufferSourceNode?} */
  #musicTrack = null;

  /** @type {Map<SoundContainer,AudioBufferSourceNode>} */
  #activeSounds = new Map();
  constructor() {
    this.piecewiseVolume.weapons.connect(this.volume);
    this.piecewiseVolume.entities.connect(this.volume);
    this.piecewiseVolume.music.connect(this.volume);
    this.piecewiseVolume.other.connect(this.volume);
    this.piecewiseVolume.bypass.connect(this.context.destination);
    this.volume.connect(this.unprocessed);
    this.volume.connect(this.processed);

    this.processed.connect(this.muffler);
    this.unprocessed.connect(this.context.destination);

    this.processed.gain.setValueAtTime(0, 0);

    this.muffler.connect(this.context.destination);
    this.muffler.type = "lowpass";
    this.muffler.frequency.value = 800; // Reduce high frequencies
    this.muffler.Q.value = 1; // Sharpness of the filter (1 is standard)
  }
  muffle() {
    this.unprocessed.gain.setValueAtTime(0, 0);
    this.processed.gain.setValueAtTime(1, 0);
  }
  unmuffle() {
    this.unprocessed.gain.setValueAtTime(1, 0);
    this.processed.gain.setValueAtTime(0, 0);
  }
  async load(path) {
    try {
      let file = await fetch(path);
      let buf = await file.arrayBuffer();
      let sound = await this.context.decodeAudioData(buf);
      console.debug(` - Loaded sound from ${path}`);
      return sound;
    } catch (e) {
      return null;
    }
  }
  /**
   * @param {SoundContainer | string} sound
   */
  setMusic(sound, isLoop = false) {
    if (!sound) return;
    if (typeof sound === "string") sound = this.sounds.get(sound);
    // Now that it's a sound container, play it
    if (this.#music === sound) return; // don't restart music

    const bufnode = this.context.createBufferSource();
    bufnode.buffer = isLoop && sound.loop ? sound.loop : sound.sound;
    bufnode.connect(this.piecewiseVolume.music);
    bufnode.onended = () => {
      bufnode.disconnect();
      this.#music = null;
      this.#musicTrack = null;
      this.setMusic(sound, true);
    };

    if (this.#musicTrack) {
      this.#musicTrack.onended = function () {
        this.disconnect();
      };
      this.#transitionTo(this.#musicTrack, bufnode, this.piecewiseVolume.music);
    } else bufnode.start(0);

    // Store the buffer node
    this.#music = sound;
    this.#musicTrack = bufnode;
  }
  stopMusic() {
    if (this.#musicTrack) {
      this.#musicTrack.onended = function () {
        this.disconnect();
      };
      this.#musicTrack.stop();
    }
    this.#musicTrack = null;
    this.#music = null;
  }
  /** @param {GainNode} gainNode  */
  #transitionTo(from, to, gainNode, duration = 0.5) {
    const now = this.context.currentTime,
      g = gainNode.gain.value;

    // Fade out
    gainNode.gain.setValueAtTime(g, now);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    from.stop(now + duration);

    // Fade in
    to.start(now + duration + 0.05);

    gainNode.gain.setValueAtTime(g, now + duration + 0.05);
  }
  /**
   * @param {SoundContainer | string} sound
   * @param {boolean} waitForEnd
   */
  play(sound, waitForEnd) {
    if (!sound) return;
    if (typeof sound === "string") sound = this.sounds.get(sound);
    // Now that it's a sound container, play it

    if (this.#activeSounds.has(sound)) {
      if (waitForEnd) return;
      else this.#activeSounds.get(sound).stop();
    }

    const bufnode = this.context.createBufferSource();
    bufnode.buffer = sound.sound;
    bufnode.connect(this.piecewiseVolume[sound.category] ?? this.piecewiseVolume.other);
    bufnode.onended = () => {
      bufnode.disconnect();
      this.#activeSounds.delete(sound);
    };
    bufnode.start(0);

    // Store the buffer node
    this.#activeSounds.set(sound, bufnode);
  }
  /**
   * @param {SoundContainer | string} sound
   */
  swap(sound, newsound, waitForEnd) {
    if (sound) {
      if (typeof sound === "string") sound = this.sounds.get(sound);
      if (this.#activeSounds.has(sound)) {
        this.dc(this.#activeSounds.get(sound));
        this.#activeSounds.delete(sound);
      }
    }
    if (newsound) {
      if (typeof newsound === "string") newsound = this.sounds.get(newsound);
      this.play(newsound, waitForEnd);
    }
  }
  /**
   * @param {SoundContainer | string} sound
   */
  playing(sound) {
    if (!sound) return false;
    if (typeof sound === "string") sound = this.sounds.get(sound);
    return this.#activeSounds.has(sound);
  }
  /**
   * @param {SoundContainer | string} sound
   */
  stop(sound) {
    if (!sound) return;
    //stop all
    if (sound === "*") {
      this.#activeSounds.forEach((b) => this.dc(b));
      this.#activeSounds.clear();
      return;
    }
    if (typeof sound === "string") sound = this.sounds.get(sound);

    const bufnode = this.#activeSounds.get(sound);
    if (bufnode) {
      this.dc(bufnode);
      this.#activeSounds.delete(sound);
    }
  }
  dc(bufnode) {
    try {
      bufnode.stop();
      bufnode.disconnect();
    } catch (e) {
      console.warn(`Failed to stop sound:`, e);
    }
  }
  commit() {
    this.sounds = new Registry();
    Registry.sounds.forEach((i, n) =>
      this.sounds.add(n, new SoundContainer(i.path, i.category ?? "other", i.loop)),
    );
    console.log(` - Prepared ${this.sounds.size} sounds for loading.`);
  }
  async loadAll() {
    let i = setTimeout(() => console.error("Timeout!"), 3000),
      c = 0;
    const mc = this.sounds.size;
    await this.sounds.forEachAsync(async (item, name) => {
      if (await item.load(this)) c++;
    });
    console.log(` - Loaded ${c}/${mc} sounds.`);
    clearTimeout(i);
  }
}

const SoundCTX = new MASoundEngine();
