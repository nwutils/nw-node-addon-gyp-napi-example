import child_process from "node:child_process";
import { createRequire } from "node:module";
import process from "node:process";
import url from "node:url";

const require = createRequire(import.meta.url);

/**
 * NW.js version of the installed `nw` package, without the `-sdk` suffix.
 * Starting with v0.111.3, NW.js publishes Node.js-compatible headers tarballs,
 * so upstream `node-gyp` can target the NW.js version directly.
 */
const nwVersion = require("nw/package.json").version.replace(/-sdk$/, "");
const disturl = "https://dl.nwjs.io/";

export function main() {
    child_process.execFileSync(
        process.execPath,
        [
            require.resolve("node-gyp/bin/node-gyp.js"),
            "rebuild",
            `--target=${nwVersion}`,
            `--disturl=${disturl}`,
        ],
        { stdio: "inherit" },
    );
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
    main();
}
