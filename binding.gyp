{
  "targets": [
    {
      "target_name": "hello",
      "sources": [ "hello.cc" ],
      # The common.gypi shipped in the NW.js headers tarball (v0.111.3+) adds
      # flags meant for NW.js' own clang/LLD toolchain:
      #  - -fuse-ld=lld on Linux and macOS. Most systems do not have LLD
      #    installed, so drop it and use the default linker.
      #  - --target=<triple> on Linux ARM. This is a clang-only flag that GCC
      #    rejects; native builds do not need it.
      "target_conditions": [
        [ "OS=='mac'", {
          "xcode_settings": {
            "OTHER_LDFLAGS!": [ "-fuse-ld=lld -Wl,-search_paths_first" ],
            "OTHER_LDFLAGS": [ "-Wl,-search_paths_first" ]
          }
        }],
        [ "OS!='mac' and OS!='win'", {
          "cflags!": [
            "--target=aarch64-linux-gnu",
            "--target=arm-linux-gnueabihf"
          ],
          "ldflags!": [
            "-fuse-ld=lld",
            "--target=aarch64-linux-gnu",
            "--target=arm-linux-gnueabihf"
          ]
        }]
      ]
    }
  ]
}
