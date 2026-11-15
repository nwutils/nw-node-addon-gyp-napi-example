import child_process from "node:child_process";
import fs from "node:fs";
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
 * Download NW.js' node.lib import library for Windows.
 * @returns {Promise<string>} absolute path to node.lib
 */
async function downloadNodeLib() {
    const arch = { x64: "x64", arm64: "arm64", ia32: "x86" }[process.arch];
    const libPath = path.join(rootDir, "cmake", "nw", arch, "node.lib");
    if (fs.existsSync(libPath)) {
        return libPath;
    }
    const response = await fetch(`${disturl}v${nwVersion}/${arch}/node.lib`);
    if (!response.ok) {
        throw new Error(`Failed to download node.lib: ${response.status} ${response.url}`);
    }
    fs.mkdirSync(path.dirname(libPath), { recursive: true });
    fs.writeFileSync(libPath, Buffer.from(await response.arrayBuffer()));
    return libPath;
}

/**
 * Node-API addon (cmake/) with cmake-js.
 * Output: cmake/build/Release/hello_cmake.node
 */
export async function buildCMakeJs() {
    const args = [
        require.resolve("cmake-js/bin/cmake-js"),
        "rebuild",
        "--directory", "cmake",
        "--out", path.join("cmake", "build"),
    ];
    if (process.platform === "win32") {
        args.push(`--CDNW_NODE_LIB=${await downloadNodeLib()}`);
    }
    return run(process.execPath, args);
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
