function getWeaponPartJSON(name) {
  try {
    return JSON.stringify(Registry.weapons.get(name).parts);
  } catch (e) {
    console.warn("Cound not get weapon JSON: " + e);
  }
}
const dev = Object.freeze({
  copyPartJSON(name) {
    navigator.clipboard.writeText(getWeaponPartJSON(name));
  },
});
