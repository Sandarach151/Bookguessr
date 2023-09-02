const sqlcon = require("./sqlcon");
const squery = sqlcon.squery;
const bcrypt = require('bcrypt');

async function insertUser(username, password) {
    const hashPassword = await bcrypt.hash(password, 12);
    const data = await squery('SELECT COUNT(*) FROM users WHERE userName = ?', [username]);
    if(data[0]['COUNT(*)']==0){
        await squery('INSERT INTO users (userPassword, userName, userPoints) VALUES (?, ?, ?)', [hashPassword, username, 0]);
    }
}

exports.insertUser = insertUser;