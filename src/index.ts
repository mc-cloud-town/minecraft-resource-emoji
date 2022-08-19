import fs from "fs";
import { basename, extname } from "path";

import glob from "glob";
import twemoji from "twemoji";
import GraphemeSplitter from "grapheme-splitter";
import { createCanvas, loadImage } from "canvas";

import { splitStringList } from "./utils";

const WIDTH = 1;
const HEIGHT = 50;

const splitter = new GraphemeSplitter();
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

glob("assets/32x32/*.png", async (_err, files) => {
  let i = 0;
  let chars = "";

  for (const file of files) {
    let [h, x] = (i++ / WIDTH)
      .toString()
      .split(".")
      .map((_) => +_);
    x ??= 0;

    const fileName = basename(file, extname(file));
    const codePoint = twemoji.convert.fromCodePoint(fileName);

    if (i > HEIGHT) {
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
        chars: splitStringList(splitter.splitGraphemes(chars), WIDTH),
      });

      chars = "";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      i = 0;
    }

    await loadImage(file).then((image) => {
      ctx.drawImage(image, 32 * x, 32 * h, 32, 32);
      chars += codePoint;
    });
  }

  fs.writeFileSync(
    "resources/assets/minecraft/font/default.json",
    JSON.stringify(data),
    "utf8"
  );
});
