import fs from "fs";

import axios from "axios";

import { snowflakeTime, stringify } from "./utils";

const GUILD_ID = "933290709589577728";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const emojis: { [id: string]: { str: string; name: string } } = {};

fs.mkdirSync("assets/discordEmojis", { recursive: true });

(async () => {
  let summonIds: string[] = [];
  let old_emoji: typeof emojis = {};

  if (fs.existsSync("assets/emoji-checkId.json")) {
    summonIds = JSON.parse(
      fs.readFileSync("assets/emoji-checkId.json", { encoding: "utf8" })
    );
  }
  if (fs.existsSync("assets/emoji-code.json")) {
    old_emoji = JSON.parse(
      fs.readFileSync("assets/emoji-code.json", { encoding: "utf8" })
    );
  }
  const data = await axios
    .get(`https://discord.com/api/v10/guilds/${GUILD_ID}/emojis`, {
      headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
    })
    .then((res): { id: string; name: string }[] => res.data);

  let index = data.filter(({ id }) => summonIds.includes(id)).length;

  for (const { id, name } of data) {
    const writeFile = async () => {
      const { data } = await axios.get(
        `https://cdn.discordapp.com/emojis/${id}.png`,
        { responseType: "arraybuffer" }
      );

      const path = `assets/discordEmojis/${id}.png`;

      fs.writeFileSync(path, data);
    };
    console.log(`${name}: ${id}`, snowflakeTime(id));

    if (
      (summonIds.includes(id) &&
        !fs.existsSync(`assets/discordEmojis/${id}.png`)) ||
      !old_emoji?.[id]
    ) {
      await writeFile();

      emojis[id] = {
        str: String.fromCharCode(
          parseInt(
            `F${summonIds.indexOf(id).toString(16).padStart(3, "0")}`,
            16
          )
        ),
        name,
      };

      continue;
    }

    emojis[id] = {
      str: String.fromCharCode(
        parseInt(`F${(++index).toString(16).padStart(3, "0")}`, 16)
      ),
      name,
    };

    await writeFile();

    summonIds.push(id);
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
