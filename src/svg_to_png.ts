import glob from "glob";
import sharp from "sharp";

glob("assets/svg/*.svg", (_err, files) => {
  for (const file of files) {
    sharp(file)
      .resize(8, 8)
      .toFile(`assets/8x8/${file.split("/").pop()?.split(".").shift()}.png`);
    // .png("assets/8x8");
  }
});
//   sharp("assets/svg", file)
