import glob from "glob";
import sharp from "sharp";

glob("assets/svg/*.svg", (_err, files) => {
  for (const file of files) {
    sharp(file)
      .resize(32, 32)
      .toFile(`assets/32x32/${file.split("/").pop()?.split(".").shift()}.png`);
  }
});
