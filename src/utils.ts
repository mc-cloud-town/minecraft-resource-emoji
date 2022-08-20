export const escapeNonAsciis = function (text: string) {
  let chars = [];
  let i = 0;

  while (i < text.length) {
    let code = text.charCodeAt(i);
    if (code < 128) chars.push(text[i]);
    else {
      if (code < 256) chars.push("\\u00");
      else if (code < 4096) chars.push("\\u0");
      else chars.push("\\u");

      chars.push(code.toString(16));
    }

    i++;
  }
  return chars.join("");
};

export const stringify: typeof JSON.stringify = (value, replacer, space) => {
  return escapeNonAsciis(JSON.stringify(value, <any>replacer, space));
};
