const { Pool } = require('pg');
const pool = new Pool({
    user: 'howmanydropped_admin',
    host: 'localhost',
    database: 'howmanydropped_db',
    password: 'qwert123',
    port: 5432
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: (callback) => pool.connect(callback)
}