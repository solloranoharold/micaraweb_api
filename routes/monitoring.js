const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = express.Router();
const fs = require("fs-extra");
const moment = require("moment");

const dbCon = require("./db");

router.use(cors());
router.use(bodyParser.json());

let querydate = `SELECT * FROM tbl_years WHERE year = '${moment().format(
  "YYYY"
)}'`;
dbCon.query(querydate, function (error, results, fields) {
  if (results.length == 0) {
    let newdate = `INSERT INTO tbl_years (year)VALUES('${moment().format(
      "YYYY"
    )}')`;
    dbCon.query(newdate, function (error, results, fields) {
      if (error) throw error;
    });
  }
});

router.get("/loadYears", (req, res) => {
  let sql = `SELECT * FROM tbl_years`;
  dbCon.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});

router.post("/insertUpdateRequest", (req, res) => {
  console.log(req.body);
  let sql = "";
  if (req.body.index == -1) {
    sql = `INSERT INTO tbl_transactions
    (user_id , visitor_name, vehicle , plate_no ,purpose)
    values
    (${req.body.user_id},'${req.body.visitor_name}','${req.body.vehicle}','${req.body.plate_no}','${req.body.purpose}')`;
  } else {
    sql = `UPDATE tbl_transactions SET user_id=${req.body.user_id} , visitor_name = '${req.body.visitor_name}'
    , vehicle='${req.body.vehicle}' , plate_no='${req.body.plate_no}' ,purpose='${req.body.purpose}'
    ,date_arrival='${req.body.date_arrival}',checkedBy='${req.body.checkedBy}' `;
    sql +=
      req.body.date_departure ||
      `,'date_departure='${req.body.date_departure}' `;
    sql += `WHERE transaction_id=${req.body.transaction_id}`;
  }
  console.log("post transacation", sql);
  dbCon.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});
router.post(`/loadTransaction`, (req, res) => {
  let sql = "";
  if (req.body.userInfo) {
    if (
      req.body.userInfo.position == "Administrator" ||
      req.body.userInfo.position == "Security Guard"
    ) {
      sql = `SELECT A.*,A.date_created AS 'DateCreated',B.*,B.fullname AS 'HomeOwner',C.fullname AS "checker"  FROM tbl_transactions A INNER JOIN tbl_accounts B ON A.user_id=B.user_id
       LEFT JOIN tbl_accounts C on A.checkedBy = C.user_id Where DATE(A.date_created)='${req.body.date}'`;
    } else {
      sql = `SELECT A.* ,B.* FROM tbl_transactions A INNER JOIN tbl_accounts B ON A.user_id=B.user_id Where DATE(A.date_created)='${req.body.date}' AND A.user_id =${req.body.userInfo.user_id}`;
    }
  } else {
    sql = `SELECT A.*,B.* FROM tbl_transactions A INNER JOIN tbl_accounts B ON A.user_id=B.user_id `;
  }
  console.log("Trnsacation", sql);
  dbCon.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});

router.get("/generateReport/:date1/:date2", (req, res) => {
  let sql = `SELECT A.*,A.date_created AS 'DateCreated', B.*,B.fullname AS 'HomeOwner',C.fullname AS "checker"  FROM tbl_transactions A INNER JOIN tbl_accounts B ON A.user_id=B.user_id
  LEFT JOIN tbl_accounts C on A.checkedBy = C.user_id Where DATE(A.date_created) BETWEEN '${req.params.date1}' AND '${req.params.date2}'`;
  dbCon.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});

module.exports = router;
