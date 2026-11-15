// hello.c: a plain C shared library, called from JavaScript via FFI (koffi)
#if defined(_WIN32)
#define EXPORT __declspec(dllexport)
#else
#define EXPORT __attribute__((visibility("default")))
#endif

EXPORT const char *hello(void) {
  return "world";
}
