function safeSplitText(text, length = 4096, splitSeparator = ' ') {
  let tempText = text;
  const parts = [];

  while (tempText) {
    if (tempText.length > length) {
      let splitPos = length;
      splitPos = tempText.substr(0, length).lastIndexOf(splitSeparator);
    
      if (splitPos < length / 4 * 3) {
        splitPos = length;
      }
      parts.push(tempText.substr(0, splitPos));
      tempText = tempText.substr(splitPos).trimLeft();
    } else {
      parts.push(tempText);
      break;
    }
  }
  return parts;
}

module.exports = { safeSplitText }