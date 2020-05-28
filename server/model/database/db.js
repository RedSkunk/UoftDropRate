const { Pool } = require('pg');
const pool = new Pool({
    user: 'howmanydropped_admin',
    host: 'localhost',
    database: 'howmanydropped_db',
    password: 'qwert123',
    port: 5432
});
// const pool = new Pool({
//     user: process.env.RDS_USERNAME,
//     host: process.env.RDS_HOSTNAME,
//     database: 'ebdb',
//     password: process.env.RDS_PASSWORD,
//     port: process.env.RDS_PORT
// });

module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: (callback) => pool.connect(callback)
}