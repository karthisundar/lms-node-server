import User from "../model/User";
import * as jwt from "../../components/auth/jwt.utils";
import * as bcrypt from "bcrypt";
import User_token from "../model/UserToken";
import sequelizeConnection from "../config";
import logger from "../../lib/logger"; // 116
import clientLabel from "../../config/clientlabel.config.json";
import UserRole from "../model/UserRole";
import UserRoleMapping from "../model/UserMaping";
import * as userService from "../../components/user/user.service";
import { Transaction } from "sequelize";
import MenuMaster from "../model/MenuMaster";
import MenuItems from "../model/MenuItems";
import RoleMenuAccess from "../model/RoleMenuAccess";
import { paginationService } from "../../components/util/pagination";

export const login = async (userData: any): Promise<any> => {
  const email = userData?.email;
  const password = userData?.password;
  const decodedString = atob(password);
  // return true
  const findUser = await User.findAll({
    attributes: [
      "user_ref_id",
      "name",
      "email",
      "password",
      "phone_number",
      "user_id",
      [sequelizeConnection.col("userRoleMap.role_id"), "role_id"],
      [sequelizeConnection.col("userRoleMap.userRole.role_name"), "role_name"],
      // [sequelizeConnection.col('userResellers.reseller_ref_id'),'reseller_ref_id'],
      // [sequelizeConnection.col('userResellers.name'),'reseller_name'],
    ],
    include: [
      {
        model: UserRoleMapping,
        required: true,
        attributes: [],
        association: "userRoleMap",
        include: [
          {
            model: UserRole,
            required: true,
            attributes: [],
            association: "userRole",
            // where:{
            //     role_id:1
            // }
          },
        ],
      },
    ],
    where: {
      email,
    },
    nest: true,
    raw: true,
  });

  const changePassword = await userService.passwordChangetoEncrypt(password, 1);
  const findDataValues = findUser[0];
  if (findUser?.length == 0) {
    throw new Error(clientLabel.user.userError.userNotFound.code);
  }

  const findOldPasswordMatch = bcrypt.compareSync(
    decodedString,
    findDataValues?.password,
  );

  if (!findOldPasswordMatch)
    throw new Error(clientLabel.user.userError.loginError.code);

  const transaction = await sequelizeConnection.transaction();
  try {
    const dataValues: any = findDataValues;
    dataValues.password = "";
    // delete dataValues.user_id
    let obj: any = {
      user_ref_id: dataValues?.user_ref_id,
      email: dataValues?.email,
      phone_number: dataValues?.phone_number,
      name: dataValues?.name,
      role_id: dataValues?.role_id,
      role: dataValues?.role_name,
    };
    const createToken = await jwt.signJWT(obj, "1y");
    dataValues.token = createToken;
    //   dataValues.user_id = findUser[0]?.dataValues?.user_id
    dataValues.createdAt = new Date();
    dataValues.updatedAt = new Date();
    dataValues.is_reseller = 0;
    const createUserToken = await User_token.create(dataValues, {
      transaction,
    });

    let tokens: any = {};
    tokens.token = createToken;
    transaction.commit();
    return tokens;
  } catch (error) {
    transaction.rollback();
    throw new Error(error);
  }
};

export const logout = async (token: any): Promise<any> => {
  const transaction = await sequelizeConnection.transaction();

  try {
    const updateTable = await User_token.destroy({
      where: {
        token,
      },
      transaction,
    });
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw new Error(error);
  }
};

export const checkUserToken = async (token: any): Promise<Boolean> => {
  const checkToken = await User_token.count({
    where: {
      token,
    },
  });

  return checkToken == 0;
};
export const setPassword = async (req: any, bodyData: any): Promise<any> => {
  let find_user_ref_id =
    bodyData?.user_ref_id !== undefined
      ? bodyData?.user_ref_id
      : req?.user_ref_id;

  let oldPassword: any;
  let newPassword: any;
  let confirmPasswords: any;
  //console.log(bodyData?.oldPassword,'req',global.atob(bodyData?.confirmPassword))

  try {
    oldPassword = global.atob(bodyData?.oldPassword);
    newPassword = global.atob(bodyData?.password);
    confirmPasswords = global.atob(bodyData?.confirmPassword);
  } catch (error) {
    throw new Error(error);
  }

  let findUserData = await User.findOne({
    where: {
      user_ref_id: find_user_ref_id,
      // is_active:true
    },
  });

  if (findUserData == null)
    throw new Error(clientLabel.user.userError.userNotFound.code);

  const findOldPasswordMatch = bcrypt.compareSync(
    oldPassword,
    findUserData?.dataValues?.password,
  );
  const trans = await sequelizeConnection.transaction();

  if (!findOldPasswordMatch)
    throw new Error(clientLabel.user.userError.oldPasswordError.code);

  if (!(newPassword == confirmPasswords))
    throw new Error(
      clientLabel.user.userError.passwordAndConfirmPasswordError.code,
    );
  try {
    await User.update(
      {
        password: bodyData?.hashPassword,
        updatedAt: new Date(),
        updatedBy: findUserData?.dataValues?.user_id,
      },
      {
        where: {
          user_ref_id: find_user_ref_id,
        },
      },
    );
    await trans.commit();
    return true;
  } catch (error) {
    console.log(error);
    logger.error(error);
    await trans.rollback();
    return error;
  }
};

export const getActionUser = async (user_ref_id: string): Promise<User> => {
  const findUser = await User.findOne({
    where: {
      user_ref_id,
    },
    nest: true,
    raw: true,
  });
  return findUser;
};

export const getAllUser = async (queryData: any): Promise<any> => {
  const page = queryData?.page;
  const limit = queryData?.pageSize;
  const getData = await User.findAll({
    attributes: [
      "user_id",
      "user_ref_id",
      "name",
      "email",
      ["is_active", "status"],
      [sequelizeConnection.col("userRoleMap.role_id"), "role_id"],
      [sequelizeConnection.col("userRoleMap.userRole.role_name"), "role"],
    ],
    include: [
      {
        model: UserRoleMapping,
        required: true,
        attributes: [],
        association: "userRoleMap",
        include: [
          {
            model: UserRole,
            required: true,
            attributes: [],
            association: "userRole",
            where: {
              role_id: 2,
            },
          },
        ],
      },
    ],
  });

  await getData?.forEach((d: any) => {
    const element = d?.toJSON();
    const status = element?.status;
    d.dataValues.status = status ? "active" : "inactive";
  });

  if (!isNaN(page) && !isNaN(limit)) {
    const pag = await paginationService(getData, page, limit);
    return pag;
  }
  return getData;
};

import { Op } from "sequelize";

export const checkCreateUser = async (queryData: any): Promise<any> => {
  const name = queryData?.name;
  const email = queryData?.email;
  const password = queryData?.password;
  const phone_number = queryData?.phoneNumber;
  const user_ref_id = queryData?.user_ref_id;

  // ---- UPDATE FLOW ----
  if (user_ref_id) {
    const findUser = await User.findOne({ where: { user_ref_id } });
    if (!findUser) {
      throw new Error("User not found");
    }

    if (email) {
      const checkEmail = await User.findOne({
        where: {
          email,
          user_ref_id: { [Op.ne]: user_ref_id },
        },
      });
      if (checkEmail) {
        throw new Error("Email Already exists");
      }
    }

    // password not mandatory on update, only validate if provided
    if (password) {
      const decodedPassword = Buffer.from(password, "base64").toString("utf-8");
      if (!decodedPassword) {
        throw new Error("Invalid password");
      }
    }

    return;
  }

  // ---- CREATE FLOW ----
  if (email) {
    const checkEmail = await User.findOne({
      where: {
        email,
      },
    });
    if (checkEmail) {
      throw new Error("Email Already exists");
    }
  }

  if (!password) {
    throw new Error("Password field is mandatory");
  }
};

export const createUser = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    const name = queryData?.name;
    const email = queryData?.email;
    const password = queryData?.password;
    const phone_number = queryData?.phoneNumber;
    const user_ref_id = queryData?.user_ref_id;
    // console.log(user_ref_id, "user_ref_iduser_ref_id", payload);
    const is_active = queryData?.is_active ?? queryData?.active;

    const findUser = await getActionUser(payload?.user_ref_id);

    // ---- UPDATE FLOW: user_ref_id present ----
    if (user_ref_id) {
      const updateObj: any = {
        name,
        phone_number,
        updatedBy: findUser?.user_id,
        updatedAt: new Date(),
      };

      // password comes base64 (btoa) encoded, decode then encrypt
      if (password) {
        const decodedPassword = Buffer.from(password, "base64").toString(
          "utf-8",
        );
        updateObj.password = await userService.passwordChangetoEncrypt(
          decodedPassword,
          1,
        );
      }

      // active/inactive flag, only update if explicitly present
      if (is_active !== undefined && is_active !== null) {
        updateObj.is_active = is_active;
        updateObj.status = is_active;
      }
      // console.log(user_ref_id, "from update");

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await User.update(updateObj, {
            where: { user_ref_id },
            transaction,
          });
        },
      );
      return true;
    }

    // ---- CREATE FLOW: user_ref_id not present, create new user ----
    const decodedPassword = password
      ? Buffer.from(password, "base64").toString("utf-8")
      : password;
    const decodePassword = await userService.passwordChangetoEncrypt(
      decodedPassword,
      1,
    );
    const isActiveDefault = true;
    let obj: any = {
      name,
      email,
      password: decodePassword,
      phone_number,
      is_active: isActiveDefault,
      createdBy: findUser?.user_id,
      createdAt: new Date(),
      status: isActiveDefault,
    };

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      const createUser = await User.create(obj, { transaction });
      console.log(createUser?.dataValues, "createUser");
      const user_id = createUser?.dataValues?.user_id;
      obj.user_id = user_id;
      obj.role_id = 2;
      await UserRoleMapping.create(obj, { transaction });
    });

    return true;
  } catch (error) {
    logger.error("Error createUser/user.ts", error);
    throw new Error(error);
  }
};

export const getAllUserMenu = async (params: any): Promise<any> => {
  const getAllUserMenu = await MenuMaster.findAll({
    attributes: [],
    include: [
      {
        model: MenuItems,
        required: true,
        attributes: [],
        association: "",
        include: [
          {
            model: RoleMenuAccess,
            required: true,
            attributes: [],
            association: "",
          },
        ],
      },
    ],
  });
};

export const deleteUser = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  const user_ref_id = queryData?.user_ref_id;
  const user = await getActionUser(payload?.user_ref_id);
  const updatedBy = user?.user_id;
  try {
    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await User.update(
        {
          deletedAt: new Date(),
          deletedBy: updatedBy,
        },
        {
          where: {
            user_ref_id,
          },
          transaction,
        },
      );
    });
  } catch (error) {
    logger.error("Error DeleteUser", error);
    throw new Error(error);
  }
};

export const getUserDetails = async (
  userRefId: string,
  payload?: any,
): Promise<any> => {
  try {
    const newRefId = userRefId ? userRefId : payload?.user_ref_id;

    const user = await User.findOne({
      where: {
        user_ref_id: newRefId,
      },
      attributes: [
        "user_id",
        "user_ref_id",
        "name",
        "email",
        "phone_number",
        "is_active",
        "createdAt",
        "updatedAt",
      ],
      raw: true,
    });

    if (!user) {
      throw new Error("USER_E_00001");
    }

    const roleMappings = await UserRoleMapping.findAll({
      where: {
        user_id: user.user_id,
        status: 1,
      },
      attributes: ["userRoleMappingId", "role_id", "user_id", "status"],
      raw: true,
    });

    const roleIds = roleMappings.map((item: any) => item.role_id);

    let roles: any[] = [];

    if (roleIds.length > 0) {
      roles = await UserRole.findAll({
        where: {
          role_id: roleIds,
        },
        raw: true,
      });
    }

    const userRoles = roleMappings.map((mapping: any) => {
      const role = roles.find(
        (item: any) => Number(item.role_id) === Number(mapping.role_id),
      );

      return {
        userRoleMappingId: mapping.userRoleMappingId,

        roleId: mapping.role_id,

        roleName: role?.role_name ?? role?.roleName ?? null,

        status: mapping.status,
      };
    });

    return {
      user_id: user.user_id,
      user_ref_id: user.user_ref_id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      is_active: user.is_active,
      roles: userRoles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    logger.error("Error getUserDetails/user.ts", error);

    throw error;
  }
};
