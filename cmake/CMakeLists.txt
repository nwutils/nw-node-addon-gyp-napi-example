cmake_minimum_required(VERSION 3.15)
cmake_policy(SET CMP0091 NEW)
cmake_policy(SET CMP0042 NEW)

# CXX must be enabled even though the addon itself is written in C: on Windows
# cmake-js adds a C++ delay-load hook (win_delay_load_hook.cc, in
# CMAKE_JS_SRC). CMake silently skips sources of languages that are not
# enabled, and without the hook the addon tries to load `node.exe` on its first
# Node-API call. NW.js has no node.exe, so the failed delay load raises an
# exception that crashes the renderer.
project(hello_cmake C CXX)

# Node-API addon built with cmake-js. Because ./package.json declares
# `binary.napi_versions`, cmake-js uses the `node-api-headers` package instead
# of downloading runtime headers, so no NW.js specific headers are needed.
add_definitions(-DNAPI_VERSION=8)

include_directories(${CMAKE_JS_INC})

add_library(${PROJECT_NAME} SHARED hello.c ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})

# On Windows, generate node.lib from the Node-API definition file. Its imports
# point at node.exe; cmake-js' delay-load hook resolves them from NW.js'
# node.dll (or nw.dll) at runtime.
if(MSVC AND CMAKE_JS_NODELIB_DEF AND CMAKE_JS_NODELIB_TARGET)
  execute_process(COMMAND ${CMAKE_AR} /def:${CMAKE_JS_NODELIB_DEF} /out:${CMAKE_JS_NODELIB_TARGET} ${CMAKE_STATIC_LINKER_FLAGS})
endif()
