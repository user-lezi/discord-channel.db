"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
async function default_1(n, func) {
    let start = performance.now();
    await func();
    let took = performance.now() - start;
    console.log(`${n} took ${(took / 1000).toFixed(3)}s`);
}
//# sourceMappingURL=took.js.map