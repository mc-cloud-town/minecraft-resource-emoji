import fs from "fs";

import { escapeNonAsciis } from "./src/utils";

const term = fs.readFileSync("./README.term.md").toString();
const emojis: Record<string, { str: string; name: string }> = JSON.parse(
  fs.readFileSync("./assets/emoji-code.json").toString()
);

const now_emojis = Object.entries(emojis)
  .map(([id, { str, name }]) => {
    return [
      "",
      "`" + name + "`",
      "`" + id + "`",
      "`" + escapeNonAsciis(str) + "`",
      "`" + str + "`",
      `![](resources/assets/discordEmojis/${id}.png)`,
      "",
    ].join("|");
  })
  .join("\n");

fs.writeFileSync(
  "README.md",
  term.replace(/\${{ *custom_unicode_insert *}}/, now_emojis)
);
