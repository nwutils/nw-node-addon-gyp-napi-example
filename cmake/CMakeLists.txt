cmake_minimum_required(VERSION 3.15)
cmake_policy(SET CMP0091 NEW)
cmake_policy(SET CMP0042 NEW)

project(hello_cmake C)

# Node-API addon built with cmake-js. Because ./package.json declares
# `binary.napi_versions`, cmake-js uses the `node-api-headers` package instead
# of downloading runtime headers, so no NW.js specific headers are needed.
add_definitions(-DNAPI_VERSION=8)

include_directories(${CMAKE_JS_INC})

add_library(${PROJECT_NAME} SHARED hello.c ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})

# On Windows, generate node.lib from the Node-API definition file. cmake-js
# adds a delay-load hook (CMAKE_JS_SRC) that resolves Node-API symbols from
# NW.js' node.dll at runtime.
if(MSVC AND CMAKE_JS_NODELIB_DEF AND CMAKE_JS_NODELIB_TARGET)
  execute_process(COMMAND ${CMAKE_AR} /def:${CMAKE_JS_NODELIB_DEF} /out:${CMAKE_JS_NODELIB_TARGET} ${CMAKE_STATIC_LINKER_FLAGS})
endif()
