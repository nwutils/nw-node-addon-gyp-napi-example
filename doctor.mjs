import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

import doctor from "@nwutils/doctor";

const require = createRequire(import.meta.url);

/* NW.js version of the installed `nw` package, without the `-sdk` suffix. */
const nwVersion = require("nw/package.json").version.replace(/-sdk$/, "");

/*
 * Look up the Node.js version bundled with this NW.js release in
 * https://nwjs.io/versions.json and write it (and the latest npm version)
 * to `devEngines` in package.json.
 */
await doctor({
    version: nwVersion,
    manifestUrl: "https://nwjs.io/versions.json",
    cacheDir: path.resolve("node_modules", ".cache", "nwutils-doctor"),
    srcDir: process.cwd(),
});

/* Keep a trailing newline in package.json. */
const manifestPath = path.resolve("package.json");
const manifest = fs.readFileSync(manifestPath, "utf8");
if (!manifest.endsWith("\n")) {
    fs.writeFileSync(manifestPath, manifest + "\n");
}
