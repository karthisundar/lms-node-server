import BucketMaster from "./model/BucketMaster";
import MenuItems from "./model/MenuItems";
import MenuMaster from "./model/MenuMaster";
import RoleMenuAccess from "./model/RoleMenuAccess";
import SessionMaster from "./model/SessionMaster";
import User from "./model/User";
import UserRoleMapping from "./model/UserMaping";
import UserRole from "./model/UserRole";
import UserSessionMapping from "./model/UserSessionMapping";
import User_token from "./model/UserToken";
import VideoMaster from "./model/VideoMaster";

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
  ]);

export default dbInit;
