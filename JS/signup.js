const sqlcon = require("./sqlcon");
const squery = sqlcon.squery;
const bcrypt = require('bcrypt');

async function insertUser(username, password) {
    const hashPassword = await bcrypt.hash(password, 12);
    await squery('INSERT INTO users (userPassword, userName, userPoints) VALUES (?, ?, ?)', [hashPassword, username, 0]);
}

exports.insertUser = insertUser;