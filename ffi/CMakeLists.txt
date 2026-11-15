cmake_minimum_required(VERSION 3.15)

project(hello_ffi C)

# A plain C shared library. It does not use any Node.js or NW.js headers: it
# is loaded at runtime through a foreign function interface (koffi).
add_library(${PROJECT_NAME} SHARED hello.c)

# Same file name and location on every platform and generator:
# build/Release/hello_ffi.{so,dylib,dll}
set_target_properties(${PROJECT_NAME} PROPERTIES
  PREFIX ""
  LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/$<CONFIG>"
  RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/$<CONFIG>"
  C_VISIBILITY_PRESET hidden
)
