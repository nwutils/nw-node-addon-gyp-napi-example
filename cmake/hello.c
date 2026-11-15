// hello.c using Node-API, built with cmake-js
#include <node_api.h>

static napi_value Method(napi_env env, napi_callback_info info) {
  napi_value greeting;
  if (napi_create_string_utf8(env, "world", NAPI_AUTO_LENGTH, &greeting) != napi_ok) {
    return NULL;
  }
  return greeting;
}

static napi_value Init(napi_env env, napi_value exports) {
  napi_value fn;
  if (napi_create_function(env, NULL, 0, Method, NULL, &fn) != napi_ok) {
    return NULL;
  }
  if (napi_set_named_property(env, exports, "hello", fn) != napi_ok) {
    return NULL;
  }
  return exports;
}

NAPI_MODULE(hello_cmake, Init)
