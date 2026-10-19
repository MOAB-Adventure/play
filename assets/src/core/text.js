function wrapWords(input = "", maxChars = 100) {
  let lines = [];
  let words = input.split(/(?=\n)| /);
  let currentLine = "";
  //for each word index
  for (let index = 0; index < words.length; index++) {
    let word = words[index];
    // console.log(`> word '${word}'`);
    let nl = word.startsWith("\n");
    if (nl) word = word.substring(1);
    if (currentLine.length + word.length > maxChars || nl) {
      lines.push(currentLine);
      currentLine = "";
    }
    currentLine += word + " ";
  }
  lines.push(currentLine);
  return lines
    .filter((x) => x.length > 0)
    .map((x) => x.trim())
    .join("\n")
    .trim();
}

function truncate(txt, maxLen) {
  const t = `${txt}`;
  return t.length > maxLen ? `${t.substring(0, maxLen - 1)}…` : t;
}

function lineTruncate(txt, maxLines) {
  const t = `${txt}`.split(/\r?\n|\r|\n/);
  return t.length > maxLines ? t.slice(0, maxLines).join("\n") + "…" : txt;
}
