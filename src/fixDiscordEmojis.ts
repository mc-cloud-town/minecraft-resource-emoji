import fs from "fs";
import { basename, extname } from "path";

import glob from "glob";
import sharp from "sharp";

import { stringify } from "./utils";

const data: Record<string, string> = {};

glob("assets/discordEmojis/*.png", (_err, files) => {
  files.forEach((file, index) => {
    const fileName = basename(file, extname(file));

    sharp(file)
      .resize(32, 32)
      .toFile(`assets/discordEmojis-32x32/emoji-${index}.png`);

    data[fileName] = String.fromCharCode(
      parseInt(`F${(+index).toString(16).padStart(3, "0")}`, 16)
    );
  });

  fs.writeFileSync("assets/emoji-code.json", stringify(data), "utf8");
});
