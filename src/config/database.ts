import {Sequelize} from 'sequelize';

const dbEnv = global.environment.db
// console.log(dbEnv) removed for secret exposure compliance
const sequelizeConnection = new Sequelize(dbEnv.database, dbEnv.user, dbEnv.password, {
    host: dbEnv.host,
    dialect:"mysql"
});


export default sequelizeConnection