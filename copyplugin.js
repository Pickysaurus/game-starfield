import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VORTEX_PLUGINS = path.join(process.env.APPDATA, "Vortex", "plugins");

//console.log("__dirname=" + __dirname);
//console.log("__filename=" + __filename);

async function removeOldPlugins(name) {
  const entries = await (
    await fs.readdir(VORTEX_PLUGINS)
  ).filter((entry) => entry.startsWith(name));
  for (const entry of entries) {
    const contents = await fs.readdir(path.join(VORTEX_PLUGINS, entry));
    for (const content of contents) {
      await fs.unlink(path.join(VORTEX_PLUGINS, entry, content));
    }
    await fs.rmdir(path.join(VORTEX_PLUGINS, entry));
  }
}

async function start() {
  const packageData = await fs.readFile(path.join(__dirname, "package.json"), {
    encoding: "utf8"
  });
  try {
    const data = JSON.parse(packageData);
    const destination = path.join(
      VORTEX_PLUGINS,
      `${data.name}-${data.version}`
    );
    try {
      await removeOldPlugins(data.name);
    } catch (err) {
      console.error(err);
    }
    const fileEntries = await fs.readdir(path.join(__dirname, "dist"));
    await fs.mkdir(destination, { recursive: true });
    for (const file of fileEntries) {
      await fs.copyFile(
        path.join(__dirname, "dist", file),
        path.join(destination, file)
      );
    }
  } catch (err) {
    console.error(err);
  }
}

start();
