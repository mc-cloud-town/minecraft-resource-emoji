import fs from "fs";

import axios from "axios";

import { snowflakeTime, stringify } from "./utils";

const GUILD_ID = "933290709589577728";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const emojis: { [id: string]: { str: string; name: string } } = {};

(async () => {
  let summonIds: string[] = [];
  if (fs.existsSync("assets/emoji-checkId.json")) {
    summonIds = JSON.parse(
      fs.readFileSync("assets/emoji-checkId.json", { encoding: "utf8" })
    );
  }
  const data = await axios
    .get(`https://discord.com/api/v10/guilds/${GUILD_ID}/emojis`, {
      headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
    })
    .then((res): { id: string; name: string }[] => res.data);

  let index = 0;

  for (const { id, name } of data.filter(({ id }) => !summonIds.includes(id))) {
    console.log(`${name}: ${id}`, snowflakeTime(id));

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

    summonIds.push(id);
  }

  let old_emoji: typeof emojis = {};
  if (fs.existsSync("assets/emoji-code.json")) {
    old_emoji = JSON.parse(
      fs.readFileSync("assets/emoji-code.json", { encoding: "utf8" })
    );
  }

  fs.writeFileSync(
    "assets/emoji-code.json",
    stringify({ ...old_emoji, ...emojis }, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    "assets/emoji-checkId.json",
    stringify(summonIds, null, 2),
    "utf8"
  );
})();
