{
  "targets": [
    {
      "target_name": "hello",
      "sources": [ "hello.cc" ],
      # The common.gypi shipped in the NW.js headers tarball (v0.111.3+) forces
      # Chromium's LLVM linker (-fuse-ld=lld) on Linux and macOS. Most systems
      # do not have lld installed, so drop it and use the default linker.
      "target_conditions": [
        [ "OS=='mac'", {
          "xcode_settings": {
            "OTHER_LDFLAGS!": [ "-fuse-ld=lld -Wl,-search_paths_first" ],
            "OTHER_LDFLAGS": [ "-Wl,-search_paths_first" ]
          }
        }],
        [ "OS!='mac' and OS!='win'", {
          "ldflags!": [ "-fuse-ld=lld" ]
        }]
      ]
    }
  ]
}
