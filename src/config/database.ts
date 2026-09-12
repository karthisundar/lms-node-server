import {Sequelize} from 'sequelize';

const dbEnv = global.environment.db
console.log(dbEnv,'from config');
const sequelizeConnection = new Sequelize(dbEnv.database, dbEnv.user, dbEnv.password, {
    host: dbEnv.host,
    dialect:"mysql"
});


export default sequelizeConnection