//#region Prop. Chain Helpers
function getValueAt(o, path) {
  const { target, final } = traverseObjectPropPath(o, path);
  return target ? target[final] : undefined;
}
/**@template T @param {T} target  */
function traverseObjectPropPath(target, path) {
  const selectors = `${path}`.split(".");
  const final = selectors.pop();
  for (const sel of selectors) target = (target ?? {})[sel];
  return { target, final };
}
/**@template T @param {T} target  */
function creativeTraverseObjectPropPath(target, path) {
  const selectors = `${path}`.split(".");
  const final = selectors.pop();
  for (let index = 0; index < selectors.length; index++) {
    const sel = selectors[index],
      next = selectors[index + 1] ?? final;

    // create array if next is a number, object if not
    // if no next, then leave it for the setter
    target[sel] ??= /\d+/.test(next) ? [] : {};
    target = target[sel];
  }
  return { target, final };
}
function setValueAt(o, path, value) {
  const { target, final } = creativeTraverseObjectPropPath(o, path);
  if (target) target[final] = value;
}
function deleteValueAt(o, path) {
  const { target, final } = traverseObjectPropPath(o, path);
  if (target) delete target[final];
}
function hasValueAt(o, path) {
  const { target, final } = traverseObjectPropPath(o, path);
  return target && final in target;
}
//#endregion
//#region ObjectPrereq
/** Matches objects against some condition. Used to choose which objects are modified. */
class ObjectPrerequisite {
  matches(o) {
    return !!o;
  }
}
class NotMetaPrerequisite {
  /** @type {ObjectPrerequisite?} */
  prereq = null;
  init() {
    this.prereq = constructFromRegistry(this.prereq, Registry.modifierTypes, ObjectPrerequisite);
  }
  matches(o) {
    return this.prereq && !this.prereq.matches(o);
  }
}
class OrMetaPrerequisite {
  /** @type {ObjectPrerequisite[]} */
  prereqs = [];
  init() {
    this.prereqs.forEach((v, i, a) => (a[i] = constructFromRegistry(v, Registry.modifierTypes, ObjectPrerequisite)));
  }
  matches(o) {
    for (const prereq of this.prereqs) {
      if (prereq.matches(o)) return true;
    }
    return false;
  }
}
class AndMetaPrerequisite {
  /** @type {ObjectPrerequisite[]} */
  prereqs = [];
  init() {
    this.prereqs.forEach((v, i, a) => (a[i] = constructFromRegistry(v, Registry.modifierTypes, ObjectPrerequisite)));
  }
  matches(o) {
    for (const prereq of this.prereqs) {
      if (!prereq.matches(o)) return false;
    }
    return true;
  }
}
class AbstractPropertyPrereq extends ObjectPrerequisite {
  prop = "";
  matches(o) {
    return hasValueAt(o, this.prop);
  }
}
class AbstractValuePrereq extends AbstractPropertyPrereq {
  value = 0;
  ref = "";
  target(o) {
    return this.ref ? getValueAt(o, this.ref) : this.value;
  }
  matches(o) {
    return getValueAt(o, this.prop) === this.target(o);
  }
}

class CaseInsensitiveEqualValuePrereq extends AbstractValuePrereq {
  matches(o) {
    return `${getValueAt(o, this.prop)}`.toLowerCase() === `${this.target(o)}`.toLowerCase();
  }
}
class InequalValuePrereq extends AbstractValuePrereq {
  matches(o) {
    return getValueAt(o, this.prop) !== this.target(o);
  }
}
class LessThanValuePrereq extends AbstractValuePrereq {
  matches(o) {
    return getValueAt(o, this.prop) < this.target(o);
  }
}
class GreaterThanValuePrereq extends AbstractValuePrereq {
  matches(o) {
    return getValueAt(o, this.prop) > this.target(o);
  }
}
//#endregion
//#region PropertyModifier
class PropertyModifier {
  prop = "";
  modify(o) {
    deleteValueAt(o, this.prop);
  }
}
class AbstractValueModifier extends PropertyModifier {
  value = 0;
  modify(o) {
    setValueAt(o, this.prop, this.value);
  }
}
class PropertyNestingModifier extends PropertyModifier {
  as = null;
  modify(o) {
    const cv = getValueAt(o, this.prop);
    if (cv !== undefined) setValueAt(o, this.prop, { [this.as ?? this.prop]: cv });
    else setValueAt(o, this.prop, {});
  }
}
class PropertyCopyModifier extends PropertyModifier {
  to = "";
  modify(o) {
    const cv = getValueAt(o, this.prop);
    if (typeof cv === "object") setValueAt(o, this.to, structuredClone(cv));
    else setValueAt(o, this.to, cv);
  }
}
class ValueMergeModifier extends AbstractValueModifier {
  modify(o) {
    setValueAt(o, this.prop, Object.assign(getValueAt(o, this.prop) ?? {}, this.value));
  }
}
class ValueAdditionModifier extends AbstractValueModifier {
  modify(o) {
    const cv = getValueAt(o, this.prop);
    if (cv !== undefined) setValueAt(o, this.prop, cv + this.value);
  }
}
class ValueSubtractionModifier extends AbstractValueModifier {
  modify(o) {
    const cv = getValueAt(o, this.prop);
    if (cv !== undefined) setValueAt(o, this.prop, cv - this.value);
  }
}
class ValueMultiplicationModifier extends AbstractValueModifier {
  modify(o) {
    const cv = getValueAt(o, this.prop);
    if (cv !== undefined) setValueAt(o, this.prop, cv * this.value);
  }
}
class ValueDivisionModifier extends AbstractValueModifier {
  modify(o) {
    const cv = getValueAt(o, this.prop);
    if (cv !== undefined) setValueAt(o, this.prop, cv / this.value);
  }
}
//#endregion
//#region ObjectAugmentor
class ObjectAugmentor {
  /** @type {ObjectPrerequisite[]} */
  prereqs = [];
  /** @type {PropertyModifier[]} */
  effects = [];
  init() {
    this.prereqs.forEach((v, i, a) => (a[i] = constructFromRegistry(v, Registry.modifierTypes, ObjectPrerequisite)));
    this.effects.forEach((v, i, a) => (a[i] = constructFromRegistry(v, Registry.modifierTypes, PropertyModifier)));
  }
  /** Tries to apply this to an object. @returns `true` if the object was modified, and `false` if it didn't match  */
  apply(o) {
    for (const pr of this.prereqs) {
      if (!pr.matches(o)) {
        console.debug(o, "failed prereq", pr);
        return false;
      }
    }
    for (const ef of this.effects) ef.modify(o);
    return true;
  }
}
//#endregion
