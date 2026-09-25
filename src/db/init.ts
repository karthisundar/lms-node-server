import BucketMaster from "./model/BucketMaster";
import CourseMaster from "./model/CourseMaster";
import LessonMaster from "./model/LessonMaster";
import LessonNoteMaster from "./model/LessonNotes";
import LessonVideoMapping from "./model/LessonVideoMapping";
import MenuItems from "./model/MenuItems";
import MenuMaster from "./model/MenuMaster";
import ModuleMaster from "./model/ModuleMaster";
import RoleMenuAccess from "./model/RoleMenuAccess";
import SessionMaster from "./model/SessionMaster";
import User from "./model/User";
import UserLessonMapping from "./model/UserLessonMapping";
import UserRoleMapping from "./model/UserMaping";
import UserRole from "./model/UserRole";
import UserSessionMapping from "./model/UserSessionMapping";
import User_token from "./model/UserToken";
import VideoMaster from "./model/VideoMaster";
import VideoWatchProgress from "./model/VideoWatchProgress";

const dbInit = () =>
  Promise.all([
    User.sync(),
    User_token.sync(),
    SessionMaster.sync(),
    UserRoleMapping.sync(),
    UserRole.sync(),
    BucketMaster.sync(),
    VideoMaster.sync(),
    UserSessionMapping.sync(),
    RoleMenuAccess.sync(),
    MenuMaster.sync(),
    MenuItems.sync(),
    VideoWatchProgress.sync(),
    CourseMaster.sync(),
    LessonMaster.sync(),
    LessonNoteMaster.sync(),
    LessonVideoMapping.sync(),
    ModuleMaster.sync(),
    UserLessonMapping.sync()
  ]);

export default dbInit;
