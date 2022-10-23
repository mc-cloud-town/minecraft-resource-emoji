import fs from "fs";
import { basename, extname } from "path";

import glob from "glob";
import twemoji from "twemoji";
import { createCanvas, loadImage } from "canvas";
import sharp from "sharp";

import { stringify } from "./utils";

/* config start */
const ASCIIS: boolean = false;
/* config end */

const asyncFiles = (path: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    glob(path, async (err, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });
};

type EmojiType = { str: string; buf32: Buffer };

const getTwitterEmoji = async () => {
  const emojis = await asyncFiles("assets/32x32/*.png");

  const result = emojis
    .filter((path) => !basename(path, extname(path)).includes("-"))
    .map((path) => {
      return {
        buf32: fs.readFileSync(path),
        str: twemoji.convert.fromCodePoint(basename(path, extname(path))),
      };
    })
    .filter((_) => _);
  return result;
};

const getDiscordEmojis = async () => {
  const emojis: Record<string, { str: string; name: string }> = JSON.parse(
    fs.readFileSync("assets/emoji-code.json", { encoding: "utf-8" })
  );

  return await Promise.all(
    Object.entries(emojis).map(async ([id, value]) => {
      const buf = fs.readFileSync(`assets/discordEmojis/${id}.png`);
      const buf32 = await sharp(buf).resize(32, 32).toBuffer();

      return { ...value, id, buf, buf32 };
    })
  );
};

const summonImg = async (filename: string, emojis: EmojiType[]) => {
  const providers: {
    // https://minecraft.fandom.com/zh/wiki/%E8%B5%84%E6%BA%90%E5%8C%85#:~:text=%E6%A0%B9%E6%A8%99%E7%B1%A4-,providers,-%3A%20%E6%8F%90%E4%BE%9B%E5%8A%A0%E5%85%A5%E8%A9%B2
    type: "bitmap";
    file: string;
    ascent: number;
    height: number;
    chars: string[];
  }[] = [];
  const chars: string[] = [];

  const width = Math.round(Math.sqrt(emojis.length * 4) / 2);
  const height = width + +(width ** 2 < emojis.length);

  const canvas = createCanvas(32 * width, 32 * height);
  const ctx = canvas.getContext("2d");

  for (const [i, { buf32, str }] of Object.entries(emojis)) {
    let y = ~~(+i / width),
      x = +i - width * y;

    await loadImage(buf32).then((image) => {
      ctx.drawImage(image, 32 * x, 32 * y, 32, 32);

      if (x === 0) chars.push(str);
      else chars[chars.length - 1] += str;
    });
  }

  /*  */
  const buffer = canvas.toBuffer("image/png");

  chars[chars.length - 1] += "\u0000".repeat(
    width - chars[chars.length - 1].length
  );

  providers.push({
    type: "bitmap",
    file: `minecraft:font/${filename}.png`,
    ascent: 8,
    height: 8,
    chars,
  });

  return { providers, buffer, filename };
};

(async () => {
  const resourcesDir = {
    font: "resources/assets/minecraft/font",
    textures_font: "resources/assets/minecraft/textures/font",
  };

  for (const path of Object.values(resourcesDir)) {
    fs.mkdirSync(path, { recursive: true });
  }

  const discordEmoji = await summonImg(
    "discord-emoji",
    await getDiscordEmojis()
  );
  const twitterEmoji = await summonImg(
    "twitter-emoji",
    await getTwitterEmoji()
  );

  fs.writeFileSync(
    `${resourcesDir.textures_font}/discord-emoji.png`,
    discordEmoji.buffer
  );
  fs.writeFileSync(
    `${resourcesDir.textures_font}/twitter-emoji.png`,
    twitterEmoji.buffer
  );

  fs.writeFileSync(
    `${resourcesDir.font}/default.json`,
    (ASCIIS ? stringify : JSON.stringify)({
      providers: [...discordEmoji.providers, ...twitterEmoji.providers],
    })
  );
})();
