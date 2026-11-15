# nw-node-addon-gyp-example

Build Node addons for NW.js four ways:

| Example | Directory | Build tool |
| --- | --- | --- |
| Node-API | `napi/` | node-gyp |
| NAN | `nan/` | node-gyp |
| Node-API | `cmake/` | cmake-js |
| FFI | `ffi/` | CMake + [koffi](https://koffi.dev) |

## node-gyp (Node-API, NAN)

From v0.111.3, pass the NW.js version and download server:

```bash
node-gyp rebuild --target=0.120.0 --disturl=https://dl.nwjs.io/
```

Output: `build/Release/<target_name>.node`. NAN uses the V8 API, so rebuild it for every NW.js version.

The NW.js `common.gypi` adds `-fuse-ld=lld` (Linux, macOS) and `--target=<triple>` (Linux ARM), which fail without LLD or with GCC. `binding.gyp` removes them in `target_defaults`.

Before v0.111.3 (from v0.83): download `nw-headers-v<version>.tar.gz` from https://dl.nwjs.io, look up the Node version in https://nwjs.io/versions.json, and run `node-gyp rebuild --target=<node version> --nodedir=<headers dir>`.

## cmake-js (Node-API)

```bash
cmake-js rebuild --directory cmake --out cmake/build
```

`binary.napi_versions` in `cmake/package.json` makes cmake-js use `node-api-headers`, so no NW.js headers are needed. Enable `CXX` in `project()` even for C addons: on Windows cmake-js adds a C++ delay-load hook, and without it the addon crashes NW.js. `CMakeLists.txt` fails the build if `CXX` is missing.

## FFI (koffi)

```bash
cmake -S ffi -B ffi/build -DCMAKE_BUILD_TYPE=Release
cmake --build ffi/build --config Release
```

A plain C library, no NW.js headers, loaded with koffi in `ffi/index.cjs`.

## Getting started

1. Use the Node.js and npm versions in `devEngines` (`npm run doctor` updates them from https://nwjs.io/versions.json after bumping `nw`).
1. Install CMake and a C/C++ compiler (Visual Studio "Desktop development with C++" on Windows).
1. `npm i`
1. `npm run build`
1. `npm run nw`: each example should show "world".
