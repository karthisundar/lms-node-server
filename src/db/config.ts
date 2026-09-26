import { Sequelize } from "sequelize";
import logger from "../lib/logger";

console.log(global.environment, "from config 112");

const dbEnv = global.environment.db;

const sequelizeConnection = new Sequelize(
  dbEnv.database,
  dbEnv.user,
  dbEnv.password,
  {
    host: dbEnv.host,
    port: Number(dbEnv.port),
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Allows connection without manually downloading the CA cert
      },
    },
    pool: {
      acquire: 500000,
    },
    // logging: false
  },
);

// Use the afterConnect hook to disable ONLY_FULL_GROUP_BY
sequelizeConnection.addHook("afterConnect", async (connection: any) => {
  console.log("test");
  connection
    .promise()
    .query(
      "SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));",
    );
});
// async function initializeDatabase() {

//     try {
//         // Now set the SQL mode after the connection has been established
//         await sequelizeConnection.query("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));");

//     } catch (error) {
//         logger.error(error);
//         console.error('Unable to connect to the database:', error);
//     }
// }

// initializeDatabase();
export default sequelizeConnection;
