import fs from "fs";

import axios from "axios";
import sharp from "sharp";

import { snowflakeTime, stringify } from "./utils";

const GUILD_ID = "933290709589577728";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const emojis: { [id: string]: { str: string; name: string } } = {};

(async () => {
  const { data } = await axios.get(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/emojis`,
    { headers: { Authorization: `Bot ${DISCORD_TOKEN}` } }
  );

  let index = 0;

  for (const { id, name } of (<{ id: string; name: string }[]>data).sort(
    (a, b) => {
      const aId = snowflakeTime(a.id);
      const bId = snowflakeTime(b.id);

      return aId < bId ? -1 : aId < bId ? 1 : 0;
    }
  )) {
    console.log(`${name}: ${id}`);

    emojis[id] = {
      str: String.fromCharCode(
        parseInt(`F${index.toString(16).padStart(3, "0")}`, 16)
      ),
      name,
    };

    const { data } = await axios.get(
      `https://cdn.discordapp.com/emojis/${id}.png`,
      { responseType: "arraybuffer" }
    );

    const path = `assets/discordEmojis/${id}.png`;

    fs.writeFileSync(path, data);

    sharp(path)
      .resize(32, 32)
      .toFile(`assets/discordEmojis-32x32/emoji-${index++}-${id}.png`);
  }

  fs.writeFileSync(
    "assets/emoji-code.json",
    stringify(emojis, null, 2),
    "utf8"
  );
})();
