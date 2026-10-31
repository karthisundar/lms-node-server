"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dbEnv = global.environment.db;
// console.log(dbEnv) removed for secret exposure compliance
const sequelizeConnection = new sequelize_1.Sequelize(dbEnv.database, dbEnv.user, dbEnv.password, {
    host: dbEnv.host,
    dialect: "mysql"
});
exports.default = sequelizeConnection;
//# sourceMappingURL=database.js.map