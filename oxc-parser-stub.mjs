// oxc-parser stub - 빈 모듈로 대체하여 네이티브 바인딩 오류 방지 (ESM)
// parseSync 등의 함수를 제공하여 import 오류 방지
// CommonJS와 ES 모듈 모두 지원

// 기본 export
const stub = {
  parseSync: () => null,
  parse: () => null,
  parseAsync: () => Promise.resolve(null),
  transform: () => null,
  transformSync: () => null,
  minify: () => ({ code: '' }),
  minifySync: () => ({ code: '' }),
};

// ES 모듈 default export
export default stub;

// ES 모듈 named exports
export const parseSync = stub.parseSync;
export const parse = stub.parse;
export const parseAsync = stub.parseAsync;
export const transform = stub.transform;
export const transformSync = stub.transformSync;
export const minify = stub.minify;
export const minifySync = stub.minifySync;

