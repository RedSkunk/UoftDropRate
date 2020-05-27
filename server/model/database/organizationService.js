const db = require('./db');

exports.addOrganization = async function(name, description) {
    try {
        const res = await db.query('INSERT INTO organization(name, description) ' + 
            'VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING name', 
            [name, description]);
        if (res.rows[0]) {
            return true;
        }
    } catch (err) {
        console.log(err.stack);
        return false;
    }
}

exports.getOrganizations = async function() {
    try {
        const res = await db.query('SELECT * FROM organization ORDER BY name', 
            []);

        return res.rows;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}