// hello.cc using NAN (Native Abstractions for Node.js)
#include <nan.h>

namespace demo {

NAN_METHOD(Hello) {
  info.GetReturnValue().Set(Nan::New("world").ToLocalChecked());
}

NAN_MODULE_INIT(Init) {
  Nan::Set(target, Nan::New("hello").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(Hello)).ToLocalChecked());
}

// Context aware, so the addon can be loaded in more than one context.
NAN_MODULE_WORKER_ENABLED(NODE_GYP_MODULE_NAME, Init)

}  // namespace demo
