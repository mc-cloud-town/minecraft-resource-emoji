import fs from "fs";

import axios from "axios";

const GUILD_ID = "933290709589577728";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

(async () => {
  const { data } = await axios.get(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/emojis`,
    { headers: { Authorization: `Bot ${DISCORD_TOKEN}` } }
  );

  for (const { id } of data) {
    console.log(id);

    await axios
      .get(`https://cdn.discordapp.com/emojis/${id}.png`, {
        responseType: "arraybuffer",
      })
      .then(({ data: blob }) => {
        fs.writeFileSync(`assets/discordEmojis/${id}.png`, blob);
      });
  }
})();
