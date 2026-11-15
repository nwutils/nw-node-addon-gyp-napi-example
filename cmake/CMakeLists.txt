cmake_minimum_required(VERSION 3.15)
cmake_policy(SET CMP0091 NEW)
cmake_policy(SET CMP0042 NEW)

project(hello_cmake C)

# Node-API addon built with cmake-js. Because ./package.json declares
# `binary.napi_versions`, cmake-js uses the `node-api-headers` package instead
# of downloading runtime headers, so no NW.js specific headers are needed.
add_definitions(-DNAPI_VERSION=8)

include_directories(${CMAKE_JS_INC})

if(MSVC AND NW_NODE_LIB)
  # On Windows, link against NW.js' own import library
  # (https://dl.nwjs.io/v<version>/<arch>/node.lib, passed in by index.mjs),
  # which imports the Node-API symbols from NW.js' node.dll. This is what
  # node-gyp does. cmake-js' default, a node.lib generated from the Node-API
  # definition file (imports from node.exe, redirected by a delay-load hook),
  # crashes the NW.js renderer on load.
  add_library(${PROJECT_NAME} SHARED hello.c)
  target_link_libraries(${PROJECT_NAME} ${NW_NODE_LIB})
else()
  add_library(${PROJECT_NAME} SHARED hello.c ${CMAKE_JS_SRC})
  target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})
  if(MSVC AND CMAKE_JS_NODELIB_DEF AND CMAKE_JS_NODELIB_TARGET)
    execute_process(COMMAND ${CMAKE_AR} /def:${CMAKE_JS_NODELIB_DEF} /out:${CMAKE_JS_NODELIB_TARGET} ${CMAKE_STATIC_LINKER_FLAGS})
  endif()
endif()

set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
