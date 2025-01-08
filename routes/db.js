var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "micaraweb",
});
// var connection = mysql.createConnection({
//   host: "bkcx36iivyb7kacrvmoc-mysql.services.clever-cloud.com",
//   user: "u9wqtgjkmr73exdf",
//   password: "5lvYH0AbcUyWIXGrojvh",
//   database: "bkcx36iivyb7kacrvmoc",
// });
module.exports = connection;
