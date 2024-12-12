require('@babel/register')({ extensions: ['.ts', '.js'] });
require('dotenv').config();

module.exports = {
  development: {
    username: `${process.env.DEV_DB_USER}`,
    password: `${process.env.DEV_DB_PASSWORD}`,
    database: `${process.env.DEV_DB_NAME}`,
    host: `${process.env.DEV_HOST}`,
    storage: '/home/anekra/Dev/Docker/docker-compose-config/sqlite/db/blogaer_auth.db',
    dialect: 'sqlite'
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'sqlite'
  },
  production: {
    username: 'root',
    password: null,
    database: 'database_production',
    host: '127.0.0.1',
    dialect: 'sqlite'
  }
};
