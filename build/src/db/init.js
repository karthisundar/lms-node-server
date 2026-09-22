"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BucketMaster_1 = __importDefault(require("./model/BucketMaster"));
const CourseMaster_1 = __importDefault(require("./model/CourseMaster"));
const LessonMaster_1 = __importDefault(require("./model/LessonMaster"));
const LessonNotes_1 = __importDefault(require("./model/LessonNotes"));
const LessonVideoMapping_1 = __importDefault(require("./model/LessonVideoMapping"));
const MenuItems_1 = __importDefault(require("./model/MenuItems"));
const MenuMaster_1 = __importDefault(require("./model/MenuMaster"));
const ModuleMaster_1 = __importDefault(require("./model/ModuleMaster"));
const RoleMenuAccess_1 = __importDefault(require("./model/RoleMenuAccess"));
const SessionMaster_1 = __importDefault(require("./model/SessionMaster"));
const User_1 = __importDefault(require("./model/User"));
const UserMaping_1 = __importDefault(require("./model/UserMaping"));
const UserRole_1 = __importDefault(require("./model/UserRole"));
const UserSessionMapping_1 = __importDefault(require("./model/UserSessionMapping"));
const UserToken_1 = __importDefault(require("./model/UserToken"));
const VideoMaster_1 = __importDefault(require("./model/VideoMaster"));
const VideoWatchProgress_1 = __importDefault(require("./model/VideoWatchProgress"));
const dbInit = () => Promise.all([
    User_1.default.sync(),
    UserToken_1.default.sync(),
    SessionMaster_1.default.sync(),
    UserMaping_1.default.sync(),
    UserRole_1.default.sync(),
    BucketMaster_1.default.sync(),
    VideoMaster_1.default.sync(),
    UserSessionMapping_1.default.sync(),
    RoleMenuAccess_1.default.sync(),
    MenuMaster_1.default.sync(),
    MenuItems_1.default.sync(),
    VideoWatchProgress_1.default.sync(),
    CourseMaster_1.default.sync(),
    LessonMaster_1.default.sync(),
    LessonNotes_1.default.sync(),
    LessonVideoMapping_1.default.sync(),
    ModuleMaster_1.default.sync(),
]);
exports.default = dbInit;
//# sourceMappingURL=init.js.map