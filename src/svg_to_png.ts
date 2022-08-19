import glob from "glob";
import sharp from "sharp";

glob("assets/svg/*.svg", (_err, files) => {
  for (const file of files) {
    sharp(file)
      .resize(40, 40)
      .toFile(`assets/40x40/${file.split("/").pop()?.split(".").shift()}.png`);
  }
});
