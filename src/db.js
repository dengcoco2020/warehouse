var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "g3ms_db"
  });

con.connect(function(err) {

});

module.exports = con;
