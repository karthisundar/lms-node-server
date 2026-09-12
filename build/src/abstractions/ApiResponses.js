"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnSuccess = void 0;
const returnSuccess = (statusCode, code, data = {}) => ({
    statusCode,
    response: {
        code,
        data,
    },
});
exports.returnSuccess = returnSuccess;
//# sourceMappingURL=ApiResponses.js.map