import { basename, extname } from "path";
import glob from "glob";
import sharp from "sharp";

glob("assets/svg/*.svg", (_err, files) => {
  for (const file of files) {
    const fileName = basename(file, extname(file));

    sharp(file).resize(32, 32).toFile(`assets/32x32/${fileName}.png`);
  }
});
