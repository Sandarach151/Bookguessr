const mysql = require('mysql2');

const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "Fibo@13213455",
	database: "bookguessr"
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