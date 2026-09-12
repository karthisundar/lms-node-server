"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerRoutes;
const express_1 = require("express");
const user_controller_1 = __importDefault(require("./components/user/user.controller"));
function registerRoutes() {
    const router = (0, express_1.Router)();
    const userController = new user_controller_1.default();
    router.use('/api/user', userController.register());
    return router;
}
//# sourceMappingURL=routes.js.map