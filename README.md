# nw-node-addon-gyp-example

Build Node addons for NW.js, using four different approaches:

| Example | Directory | Build tool | Uses NW.js headers? |
| --- | --- | --- | --- |
| [Node-API](#node-api-and-nan-with-node-gyp) | `napi/` | `node-gyp` | Yes |
| [NAN](#node-api-and-nan-with-node-gyp) | `nan/` | `node-gyp` | Yes (V8 API, must match the NW.js version) |
| [Node-API with cmake-js](#node-api-with-cmake-js) | `cmake/` | `cmake-js` | No (`node-api-headers`) |
| [FFI](#ffi-with-koffi) | `ffi/` | CMake | No (plain C library) |

## Node-API and NAN with node-gyp

### v0.111.3 and later

Starting with v0.111.3, NW.js publishes Node.js-compatible headers tarballs, so upstream `node-gyp` can build addons directly. No manual header download, `nw-gyp` or custom environment variables are needed.

1. (Re)build Node addons for NW.js by passing the **NW.js version** as the target and the NW.js download server as the dist URL:

   ```bash
   node-gyp rebuild --target=0.120.0 --disturl=https://dl.nwjs.io/
   ```

   `node-gyp` downloads and caches the headers from the NW.js download server automatically. The same flags work with npm:

   ```bash
   npm rebuild --target=0.120.0 --disturl=https://dl.nwjs.io/
   ```

   Note: the `common.gypi` shipped with the NW.js headers adds flags meant for NW.js' own clang/LLD toolchain: `-fuse-ld=lld` on Linux and macOS, and `--target=<triple>` on Linux ARM. Without LLD, or with GCC, the build fails (`cannot find 'ld'`, `invalid linker name in argument '-fuse-ld=lld'`, `unrecognized command-line option '--target=aarch64-linux-gnu'`). Remove the flags in your `binding.gyp` as this example does (see `target_defaults`).

1. The compiled addon will be at `$PWD/build/Release/{addon_name}.node`. For example, if the `target_name` in your `binding.gyp` file is `hello`, then the file will be `$PWD/build/Release/hello.node`.
1. Import the module inside your application: `const { hello } = require('./build/Release/hello');`

[NAN](https://github.com/nodejs/nan) addons use the V8 C++ API, which changes between versions, so they must be rebuilt for every NW.js version. Node-API addons are ABI stable.

### v0.83 to v0.111.2

1. Download NW.js Node headers tarball from https://dl.nwjs.io. For example, for headers for v0.99.1 can be downloaded [here](https://dl.nwjs.io/v0.99.1/nw-headers-v0.99.1.tar.gz).
1. Get the Node version used by the NW.js release version from https://nwjs.io/versions.json. For example, for v0.99.1 the Node version is 23.11.0
1. (Re)build Node addons for NW.js: `node-gyp rebuild --target=23.11.0 --nodedir=/path/to/node/headers/directory`
1. The compiled addon will be at `$PWD/build/Release/{addon_name}.node`.

## Node-API with cmake-js

[cmake-js](https://github.com/cmake-js/cmake-js) builds the addon in `cmake/` with CMake. Because `cmake/package.json` declares `binary.napi_versions`, cmake-js uses the `node-api-headers` package instead of downloading runtime headers. On Windows, it generates `node.lib` from the Node-API definition file, and its delay-load hook resolves the Node-API symbols from NW.js' `node.dll` at runtime.

```bash
cmake-js rebuild --directory cmake --out cmake/build
```

The addon will be at `cmake/build/Release/hello_cmake.node`.

## FFI with koffi

`ffi/` contains a plain C shared library, built with CMake. It does not use any Node.js or NW.js headers. It is loaded at runtime with [koffi](https://koffi.dev), a Node-API based foreign function interface (see `ffi/index.cjs`).

```bash
cmake -S ffi -B ffi/build -DCMAKE_BUILD_TYPE=Release
cmake --build ffi/build --config Release
```

The library will be at `ffi/build/Release/hello_ffi.{so,dylib,dll}`.

## Getting Started with demo application

1. Clone repo
1. Use the Node.js and npm versions in `devEngines` in `package.json`. The Node.js version matches the one bundled with NW.js.
1. Install [CMake](https://cmake.org/) and a C/C++ compiler (Visual Studio with the "Desktop development with C++" workload on Windows).
1. `npm i` to install Node modules
1. After bumping `nw`, run `npm run doctor` to update `devEngines` from https://nwjs.io/versions.json via [`@nwutils/doctor`](https://www.npmjs.com/package/@nwutils/doctor)
1. `npm run build` to build all examples
1. `npm run nw` to run NW.js app. You should see "world" next to each example.
