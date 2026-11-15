const path = require("node:path");
const process = require("node:process");

const koffi = require("koffi");

const extensions = {
    darwin: ".dylib",
    win32: ".dll",
};

const libraryPath = path.join(
    __dirname,
    "build",
    "Release",
    "hello_ffi" + (extensions[process.platform] ?? ".so"),
);

const lib = koffi.load(libraryPath);

module.exports = {
    hello: lib.func("const char *hello(void)"),
};
