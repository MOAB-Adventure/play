//Background, title, etc
//Start menu background and header
createUIComponent(["load-game"], [], 960, 540, 700, 700);
createUIComponent(
  ["load-game"],
  [],
  960,
  220,
  1000,
  75,
  "none",
  undefined,
  "*         Load Game",
  false,
  50,
);
//Back to title screen button
createUIComponent(
  ["load-game"],
  [],
  570,
  222,
  200,
  50,
  "none",
  () => {
    ui.menuState = "start-menu";
  },
  "*< Back",
  false,
  30,
).isBackButton = true;
function getSaveDescription(sv) {
  if (!sv) return "No data";
  return (
    (sv?.won ? "< Completed >" : (
      Registry.worlds.get(sv?.world ?? "ocean-skies").name + ", Level " + (sv?.level ?? 0)
    )) +
    "\n" +
    (sv?.difficulty ?? "easy").substring(0, 4).toUpperCase() +
    "-" +
    (sv?.mode ?? "adventure").substring(0, 3).toUpperCase() +
    " | S:" +
    shortenedNumber(sv?.shards) +
    " B:" +
    shortenedNumber(sv?.bloonstones)
  );
}
/**@type {{info: UIComponent, deleter: UIComponent, converter: UIComponent}[]} */
let ss = [];
for (let i = 0; i < 6; i++) {
  ss.push({
    info: createUIComponent(
      ["load-game"],
      [],
      890,
      330 + 100 * i,
      500,
      75,
      "none",
      null,
      "please wait...",
      true,
      30,
    ),
    deleter: createUIComponent(
      ["load-game"],
      [],
      1220,
      330 + 100 * i,
      120,
      75,
      "none",
      () => deleteGame(i),
      "Delete",
      true,
      30,
    ),
    converter: createUIComponent(
      ["load-game"],
      [],
      1220,
      330 + 100 * i,
      120,
      75,
      "none",
      () => {
        try {
          let s = Serialiser.get("save." + i);
          Serialiser.set(
            "save." + i,
            convertSave(s, s?.saveFormatVersion, CURRENT_SAVE_FORMAT_VERSION),
          );
          regenSaveDescrs();
        } catch (e) {
          console.error("Could not convert slot " + i + " to current save version:", e);
        }
      },
      "Try Convert",
      true,
      30,
    ),
  });
}

function regenSaveDescrs() {
  ss.forEach((slot, i) => {
    let sv = Serialiser.get("save." + i);
    let existing = !!sv;
    let goodFormat = sv?.saveFormatVersion === CURRENT_SAVE_FORMAT_VERSION;
    let valid = goodFormat;
    // console.log("save ","save." + i, "->", sv, existing ? " exists" : " doesnt exist", "and", valid ? "is valid" : "is invalid")
    slot.info.text =
      i +
      " | " +
      (!existing ? "No data"
      : goodFormat ? getSaveDescription(sv)
      : `Incompatible Format\n(v${
          sv?.saveFormatVersion ?? 0
        }, current v${CURRENT_SAVE_FORMAT_VERSION})`);
    slot.info.press =
      valid ?
        () => {
          ui.menuState = "in-game";
          UIComponent.setCondition("saveslot:" + i);
          game.saveslot = i;
          startGame();
          loadGame(i);
        }
      : () => {};
    slot.deleter.interactive =
      slot.deleter.isInteractive =
      slot.info.interactive =
      slot.info.isInteractive =
        valid;
    slot.converter.interactive = slot.converter.isInteractive = existing && !valid;
    slot.converter.getActivity = () => existing && !valid;
    slot.deleter.text = existing ? "Delete" : "...";
    if (!existing) {
      slot.info.outlineColour = col.mono(50);
      slot.deleter.outlineColour = col.mono(50);
    }
  });
  saveSlotSel.forEach((c, i) =>
    UIComponent.setOutlineColour(c, Serialiser.get("save." + i) ? col.from(150, 0, 0) : col.mono(50)),
  );
}
regenSaveDescrs();
