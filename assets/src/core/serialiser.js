//### The class that does most of it ###

class ResourceLocation {
  static storageAvailable = true;
  static defaultNamespace = "ma";
  /** Defines what mod this resource belongs to. */
  namespace = ResourceLocation.defaultNamespace;
  /** The name that this resource is stored under. Should be in kebab-case. */
  slot = "#";
  /** Defines the resource location entirely. */
  get qualifier() {
    return this.isNull ? "null" : this.namespace + ":" + this.slot;
  }
  /** Is this a null pointer? */
  isNull = false;
  constructor(qualifier) {
    if (!qualifier) qualifier = "null";
    if (typeof qualifier !== "string") qualifier = `${qualifier}`;

    if (qualifier === "null") this.isNull = true;

    const ci = qualifier.indexOf(":");
    if (ci !== -1) {
      this.namespace = qualifier.substring(0, ci);
      this.path = qualifier.substring(ci + 1);
    } else this.path = qualifier;
  }
  /** Makes an equivalent ResourceLocation object. */
  clone() {
    return new this(this.qualifier);
  }
  /** Returns the data at this location.
   * @returns {Object | null} Null if the location is empty, otherwise the data.
   */
  get() {
    if (!ResourceLocation.storageAvailable) {
      throw new ReferenceError("Storage system unavailable.");
    }
    const ns = localStorage.getItem(this.nsid());
    if (ns === null) return null;
    const namespaceStorage = JSON.parse(ns);

    const grabbed = getValueAt(namespaceStorage, this.path);
    return grabbed ?? null;
  }
  /** Returns the data at this location, without parsing the `path` property as a sequence of getters. THis method treats the property as a single name.
   * @returns {Object | null} Null if the location is empty, otherwise the data.
   */
  getNT() {
    if (!ResourceLocation.storageAvailable) {
      throw new ReferenceError("Storage system unavailable.");
    }
    const ns = localStorage.getItem(this.nsid());
    if (ns === null) return null;

    return JSON.parse(ns)[this.path] ?? null;
  }

  set(data = {}) {
    if (!ResourceLocation.storageAvailable) {
      throw new ReferenceError("Storage system unavailable.");
    }
    if (this.isNull) {
      throw new TypeError("Cannot set value of the null pointer!");
    }

    const nsid = this.nsid();
    const ns = localStorage.getItem(nsid);
    let namespaceStorage = {};
    if (ns !== null) namespaceStorage = JSON.parse(ns);

    setValueAt(namespaceStorage, this.path, data);
    localStorage.setItem(nsid, JSON.stringify(namespaceStorage));
  }
  /**
   * Removes data at this location.
   */
  delete() {
    if (!ResourceLocation.storageAvailable) {
      throw new ReferenceError("Storage system unavailable.");
    }
    if (this.isNull) {
      throw new TypeError("Cannot delete the null pointer!");
    }
    //Throw error if bad location
    if (!this.get()) throw new ReferenceError("Cannot delete nonexistent location");
    //Set item
    let namespaceStorage = JSON.parse(localStorage.getItem(this.nsid()));
    delete namespaceStorage[this.type + "." + this.slot];
    localStorage.setItem(this.nsid(), JSON.stringify(namespaceStorage));
  }
  /** **N**ame**s**pace **Id**entifier: The actual localStorage key name of this location's namespace. */
  nsid() {
    return namespaceID(this.namespace);
  }
}

//### Interface ###
const Serialiser = {
  get available() {
    return ResourceLocation.storageAvailable;
  },
  /**
   * Gets some data from a qualified path. Useful for getting data from a single string.
   * @param {string} qualifier Full path to the saved data. Does not require the namespace (`ma: ...`)
   * @returns The data stored.
   */
  get(qualifier) {
    return new ResourceLocation(qualifier).get();
  },
  /**
   * Gets some data from a qualified path. Less useful for getting data from a single string, since the qualifier is not parsed as a nested property getter - instead, it is kept as a single string.
   * @param {string} qualifier Full path to the saved data. Does not require the namespace (`ma: ...`)
   * @returns The data stored.
   */
  getNT(qualifier) {
    return new ResourceLocation(qualifier).getNT();
  },
  /**
   * Saves some data to localStorage.
   * @param {Object} data The object to save to localStorage.
   * @param {string} qualifier Where to save these data.
   * @returns {Boolean} Whether or not the operation succeeded.
   */
  set(qualifier, data) {
    let location = new ResourceLocation(qualifier);
    try {
      location.set(data);
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        console.warn("Could not save data: Too many saves!");
      } else if (err instanceof Error) console.warn("Could not save data: " + err.message + " (" + err.constructor?.name + ")");
      else console.warn("Could not save data: " + err);
    }
    return false;
  },
  /**
   * Removes data from a location.
   * @param {string} qualifier Where the data to delete are.
   * @returns {Boolean} Whether or not the operation succeeded.
   */
  delete(qualifier) {
    let location = new ResourceLocation(qualifier);
    try {
      location.delete();
      return true;
    } catch (err) {
      console.warn("Could not delete data: " + err.message + " (" + err.constructor?.name + ")");
      return false;
    }
  },
  /**
   * Clears all save items from a particular namespace.
   * @param {keyof Window.localStorage | "*"} namespace Namespace to clear items from. This differentiates saves from different mods. Use `*` to clear all saves.
   * @returns {Boolean} Whether or not the operation succeeded.
   */
  clear(namespace = ResourceLocation.defaultNamespace) {
    if (!ResourceLocation.storageAvailable) {
      console.warn("Could not clear data: Storage unavailable.");
      return false;
    }
    if (namespace === "*") {
      localStorage.clear();
      return true;
    }
    const search = namespaceID(namespace);
    iterateStorage(localStorage, (key, value) => {
      if (key === search) localStorage.removeItem(key);
    });
    return true;
  },
};

//Feature check
if (!storageAvailable("localStorage")) {
  console.warn("Invalid session: Serialiser will be unavailable.");
  ResourceLocation.storageAvailable = false;
}

//MDN localStorage Feature Detection script
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "_";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException
      && e.name === "QuotaExceededError"
      // acknowledge QuotaExceededError only if there's something already stored
      && storage
      && storage.length !== 0
    );
  }
}

//### Helper functions ###

function namespaceID(namespace) {
  return "Namespace[" + namespace + "]";
}

//Seriously why does this not exist
/**
 * @param {Storage} storage
 * @param {(key: string, value: any) => void} callback
 */
function iterateStorage(storage, callback) {
  let len = storage.length;
  for (let index = 0; index < len; index++) {
    let key = storage.key(index);
    if (key) void callback(key, storage.getItem(key));
  }
}
