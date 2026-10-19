/** Generic type constructor. Uses `Registry.genericType` as the source for any template.
 * @param {{type: string | undefined}} object Source to construct from. This object is left unchanged. Type must be present in `Registry.genericType`, or else `Object` is used instead.
 */
function construct(object, defaultType = Object) {
  return constructFromRegistry(object, Registry.genericType, defaultType);
}
/** Bullet constructor. Only makes bullets, or generic objects if input type is invalid.\
 * Can make use of the 'telegraph' property on bullets.
 * @param {{type: string | undefined}} object Source to construct from. This object is left unchanged. Type must be present in `Registry.bulletType`, or else `Object` is used instead.
 */
function bullet(object, defaultType = Bullet) {
  let b = object.telegraph ? telegraph(object, object.telegraph) : object;
  return constructFromRegistry(b, Registry.bulletType, defaultType);
}
/** Weapon constructor. Only makes weapons, or generic objects if input type is invalid. \
 * Applies soul effects.
 * @param {{type: string | undefined}} object Source to construct from. This object is left unchanged. Type must be present in `Registry.weaponType`, or else `Object` is used instead.
 */
function weapon(object, defaultType = Weapon) {
  if (!object) return; //Catch accidental calls using null, undefined or similar

  //Constructs an instance using type from registry, if it exists. If not, throw error.
  //If type is undefined, use the default.
  let instantiated = new (object.type ? Registry.weaponType.get(object.type) : defaultType)();
  let cloned = {};
  //Clone the object if possible, to copy stuff like bullet drawers, or weapon.shoot.pattern. If it fails, just use the original.
  try {
    cloned = structuredClone(object);
    if (game.infuse) infusions.forEach((i, n) => i.apply(cloned));
  } catch (error) {
    cloned = object;
    console.warn("Skipping soul effects, as I could not clone object:", error);
  }
  instantiated = Object.assign(instantiated, cloned);
  instantiated.init ? instantiated.init() : {}; //Initialise if possible.
  return instantiated;
}

function constructFromRegistry(object, registry, defaultType = Object) {
  if ((!registry) instanceof Registry) throw new ReferenceError(`'${registry}' is not a valid registry!`); //Catch bad (nonexistent or non-registry) registry
  if (!object) return; //Catch accidental calls using null, undefined or similar

  //Constructs an instance using type from registry, if it exists. If not, throw error.
  //If type is undefined, use the default.
  let instantiated = new (object.type ? registry.get(object.type) : defaultType)();
  let cloned = {};
  //Clone the object if possible, to copy stuff like bullet drawers, or weapon.shoot.pattern. If it fails, just use the original.
  try {
    cloned = structuredClone(object);
  } catch (error) {
    cloned = object;
    console.warn("Could not clone object:", error);
  }
  instantiated = Object.assign(instantiated, cloned);
  instantiated.init ? instantiated.init() : {}; //Initialise if possible.
  return instantiated;
}

function constructFromType(object, type = Object) {
  if (!object) return; //Catch accidental calls using null, undefined or similar

  //Constructs an instance using type from registry, if it exists. If not, throw error.
  //If type is undefined, use the default.
  let instantiated = new type();
  let cloned = {};
  //Clone the object if possible, to copy stuff like bullet drawers, or weapon.shoot.pattern. If it fails, just use the original.
  try {
    cloned = structuredClone(object);
  } catch (error) {
    cloned = object;
    console.warn("Could not clone object:", error);
  }
  instantiated = Object.assign(instantiated, cloned);
  instantiated.init ? instantiated.init() : {}; //Initialise if possible.
  return instantiated;
}
