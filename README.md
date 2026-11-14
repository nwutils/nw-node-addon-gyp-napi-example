# nw-node-addon-gyp-example

Build Node Addon using `node-gyp`.

## Approach (v0.111.3 and later)

Starting with v0.111.3, NW.js publishes Node.js-compatible headers tarballs, so upstream `node-gyp` can build addons directly. No manual header download, `nw-gyp` or custom environment variables are needed.

1. (Re)build Node addons for NW.js by passing the **NW.js version** as the target and the NW.js download server as the dist URL:

   ```bash
   node-gyp rebuild --target=0.120.0 --disturl=https://dl.nwjs.io/
   ```

   `node-gyp` downloads and caches the headers from the NW.js download server automatically. The same flags work with npm:

   ```bash
   npm rebuild --target=0.120.0 --disturl=https://dl.nwjs.io/
   ```

   Note: the `common.gypi` shipped with the NW.js headers adds `-fuse-ld=lld` to the link flags on Linux and macOS. If you don't have [LLD](https://lld.llvm.org/) installed, linking fails (`cannot find 'ld'` on Linux, `invalid linker name in argument '-fuse-ld=lld'` on macOS). Either install LLD, or remove the flag in your `binding.gyp` as this example does.

1. The compiled addon will be at `$PWD/build/Release/{addon_name}.node`. For example, if the `target` value in your `binding.gyp` file is `hello`, then the file will be `$PWD/build/Release/hello.node`.
1. Import the module inside your application: `const { hello } = require('./build/Release/hello');`

## Approach (v0.83 to v0.111.2)

1. Download NW.js Node headers tarball from https://dl.nwjs.io. For example, for headers for v0.99.1 can be downloaded [here](https://dl.nwjs.io/v0.99.1/nw-headers-v0.99.1.tar.gz).
1. Get the Node version used by the NW.js release version from https://nwjs.io/versions.json. For example, for v0.99.1 the Node version is 23.11.0
1. (Re)build Node addons for NW.js: `node-gyp rebuild --target=23.11.0 --nodedir=/path/to/node/headers/directory`
1. The compiled addon will be at `$PWD/build/Release/{addon_name}.node`.

## Getting Started with demo application

1. Clone repo
1. Use the Node.js and npm versions in `devEngines` in `package.json`. The Node.js version matches the one bundled with NW.js.
1. `npm i` to install Node modules
1. After bumping `nw`, run `npm run doctor` to update `devEngines` from https://nwjs.io/versions.json via [`@nwutils/doctor`](https://www.npmjs.com/package/@nwutils/doctor)
1. `npm run gyp` to build the Node Native Addon with `node-gyp` (headers are fetched from https://dl.nwjs.io)
1. `npm run nw` to run NW.js app.
