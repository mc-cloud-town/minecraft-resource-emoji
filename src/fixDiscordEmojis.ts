import glob from "glob";
import sharp from "sharp";

glob("assets/discordEmojis/*.png", (_err, files) => {
  files.forEach((file, index) => {
    sharp(file)
      .resize(32, 32)
      .toFile(`assets/discordEmojis-32x32/emoji-${index}.png`);
  });
});
