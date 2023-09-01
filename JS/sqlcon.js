const mysql = require('mysql2');

const con = mysql.createConnection({
	host: "bookguessr-db.clybag8f9qab.ap-southeast-2.rds.amazonaws.com",
	user: "squire",
	password: "genesis4723",
	database: "bookguessr_db2"
});

async function squery(queryString, values) {
	return new Promise((resolve, reject) => {
		con.connect(function (err) {
			if (err) reject(err);
			con.query(queryString, values, function (err, result, fields) {
				if (err) reject(err);
				resolve(result);
			});
		});
	});
}

exports.squery = squery;