import child_process from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import url from "node:url";

const require = createRequire(import.meta.url);
const rootDir = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * NW.js version of the installed `nw` package, without the `-sdk` suffix.
 * Starting with v0.111.3, NW.js publishes Node.js-compatible headers tarballs,
 * so upstream `node-gyp` can target the NW.js version directly.
 */
const nwVersion = require("nw/package.json").version.replace(/-sdk$/, "");
const disturl = "https://dl.nwjs.io/";

/**
 * Run a command asynchronously, so callers (e.g. the test runner) are not
 * blocked while a native build is running.
 * @param {string} command - executable
 * @param {string[]} args - arguments
 * @returns {Promise<void>}
 */
function run(command, args) {
    return new Promise((resolve, reject) => {
        const child = child_process.spawn(command, args, {
            cwd: rootDir,
            stdio: "inherit",
        });
        child.on("error", reject);
        child.on("exit", (code, signal) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${[command, ...args].join(" ")} failed (code: ${code}, signal: ${signal})`));
            }
        });
    });
}

/**
 * Node-API and NAN addons (binding.gyp) with node-gyp, against the NW.js
 * headers. Output: build/Release/hello.node, build/Release/hello_nan.node
 */
export function buildGyp() {
    return run(process.execPath, [
        require.resolve("node-gyp/bin/node-gyp.js"),
        "rebuild",
        `--target=${nwVersion}`,
        `--disturl=${disturl}`,
    ]);
}

/**
 * Node-API addon (cmake/) with cmake-js.
 * Output: cmake/build/Release/hello_cmake.node
 */
export function buildCMakeJs() {
    return run(process.execPath, [
        require.resolve("cmake-js/bin/cmake-js"),
        "rebuild",
        "--directory", "cmake",
        "--out", path.join("cmake", "build"),
    ]);
}

/**
 * Plain C shared library (ffi/) with CMake, loaded via koffi.
 * Output: ffi/build/Release/hello_ffi.{so,dylib,dll}
 */
export async function buildFfi() {
    const buildDir = path.join("ffi", "build");
    await run("cmake", ["-S", "ffi", "-B", buildDir, "-DCMAKE_BUILD_TYPE=Release"]);
    await run("cmake", ["--build", buildDir, "--config", "Release"]);
}

export async function main() {
    await buildGyp();
    await buildCMakeJs();
    await buildFfi();
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
    await main();
}
