// oxc-parser stub - 빈 모듈로 대체하여 네이티브 바인딩 오류 방지 (CommonJS)
// parseSync 등의 함수를 제공하여 import 오류 방지

const stub = {
  parseSync: () => null,
  parse: () => null,
  parseAsync: () => Promise.resolve(null),
  transform: () => null,
  transformSync: () => null,
  minify: () => ({ code: '' }),
  minifySync: () => ({ code: '' }),
};

// CommonJS export
module.exports = stub;
module.exports.default = stub;

// Named exports도 지원
module.exports.parseSync = stub.parseSync;
module.exports.parse = stub.parse;
module.exports.parseAsync = stub.parseAsync;
module.exports.transform = stub.transform;
module.exports.transformSync = stub.transformSync;
module.exports.minify = stub.minify;
module.exports.minifySync = stub.minifySync;

