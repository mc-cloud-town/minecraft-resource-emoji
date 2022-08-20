import fs from "fs";
import { basename, extname } from "path";

import glob from "glob";
import twemoji from "twemoji";
import { createCanvas, loadImage } from "canvas";

import { stringify } from "./utils";

/* config start */
const WIDTH = 19; // 19 * 76 = 1444
const HEIGHT = 77; // 19 * 4
const ASCIIS = false;
/* config end */

const canvas = createCanvas(32 * WIDTH, 32 * HEIGHT);
const ctx = canvas.getContext("2d");
const data: {
  // https://minecraft.fandom.com/zh/wiki/%E8%B5%84%E6%BA%90%E5%8C%85#:~:text=%E6%A0%B9%E6%A8%99%E7%B1%A4-,providers,-%3A%20%E6%8F%90%E4%BE%9B%E5%8A%A0%E5%85%A5%E8%A9%B2
  providers: {
    type: "bitmap";
    file: string;
    ascent: number;
    height: number;
    chars: string[];
  }[];
} = { providers: [] };

const asyncFiles = (path: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    glob(path, async (err, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });
};

(async () => {
  const files = await asyncFiles("assets/32x32/*.png");
  files.push(...(await asyncFiles("assets/discordEmojis-32x32/*.png")));

  let i = 0;
  let counts = 0;
  let chars: string[] = [];

  for (const [index, file] of files.entries()) {
    const fileName = basename(file, extname(file));

    const emojiIndex = /emoji-(?<emojiIndex>[0-9]+)/
      .exec(fileName)
      ?.groups?.emojiIndex?.split("-")[0];

    if (fileName.includes("-") && !emojiIndex) continue;

    const codePoint =
      emojiIndex === void 0
        ? // ? fileName.split("-").map(twemoji.convert.fromCodePoint).join("")
          twemoji.convert.fromCodePoint(fileName)
        : String.fromCharCode(
            parseInt(`F${(+emojiIndex).toString(16).padStart(3, "0")}`, 16)
          );

    let [h, x] = (i++ / WIDTH)
      .toString()
      .split(".")
      .map((_) => +_);
    x = i - h * WIDTH - 1;

    await loadImage(file).then((image) => {
      ctx.drawImage(image, 32 * x, 32 * h, 32, 32);

      if (x === 0) chars.push(codePoint);
      else chars[chars.length - 1] += codePoint;

      console.log(fileName, codePoint);
    });

    if (i >= WIDTH * HEIGHT || index + 1 >= files.length) {
      const buffer = canvas.toBuffer("image/png");

      fs.writeFileSync(
        `resources/assets/minecraft/textures/font/${fileName}.png`,
        buffer
      );

      data.providers.push({
        type: "bitmap",
        file: `minecraft:font/${fileName}.png`,
        ascent: 8,
        height: 8,
        chars: (() => {
          while (chars.length < HEIGHT) chars.push("\u0000".repeat(WIDTH));
          return chars;
        })(),
      });

      console.log(chars);
      chars = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      i = 0;
    }
    counts++;
  }

  fs.writeFileSync(
    "resources/assets/minecraft/font/default.json",
    (ASCIIS ? stringify : JSON.stringify)(data),
    "utf8"
  );

  console.log(`完成共 ${counts}`);
})();
