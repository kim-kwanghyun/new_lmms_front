// oxc-parser stub - 빈 모듈로 대체하여 네이티브 바인딩 오류 방지
// ES 모듈과 CommonJS 모두 지원

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

// ES 모듈 interop을 위한 추가 설정
if (typeof exports !== 'undefined') {
  Object.defineProperty(exports, '__esModule', { value: true });
}

