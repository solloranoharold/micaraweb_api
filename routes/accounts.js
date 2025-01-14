const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = express.Router();
const fs = require("fs-extra");
const moment = require("moment");
var md5 = require("md5");
const multer = require("multer");

const dbCon = require("./db");

router.use(cors());
router.use(bodyParser.json());

let path_profile = "./uploads/users";
const users_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(path_profile, { recursive: true });
    cb(null, path_profile);
  },
  filename: function (req, file, cb) {
    let data = JSON.parse(req.body.myData);
    cb(null, data.profile_img);
  },
});

var upload_profile = multer({ storage: users_storage });
router.post("/uploadImg", upload_profile.single("file"), (req, res) => {
  res.send("success");
});

router.get("/positions", (req, res) => {
  let sql = "SELECT * FROM tbl_positions";
  dbCon.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});


 function findUserLength() { 
   return new Promise(resolve => { 
     let sql = "SELECT * FROM tbl_accounts where position_id!=1";
      dbCon.query(sql, function (error, results, fields) {
        if (error) throw error;
       resolve(results)
      });
  })
}

router.get('/usersLength', async (req, res) => { 
  let users = await findUserLength()
  let user_id = (users.length + 1).toString().padStart(6, '0');
  res.send({user_id : user_id})
})
router.post("/insertUpdateAccounts", async(req, res) => {
  console.log('/insertUpdateAccounts',req.body);
  let sql = "";
  let users = await findUserLength()
  let user_id = (users.length + 1 ).toString().padStart(6, '0');
  let newpassword = md5(req.body.password);
  if (req.body.index == -1) {
    sql = `
      insert into tbl_accounts
      (user_id , position_id,profile_img,firstname,lastname,gender,phase,block,lot,street,contactno,username,password)
      values
      (
      '${user_id}',
      ${req.body.position_id},
      '${ req.body.profile_img}',
      '${req.body.firstname.toUpperCase()}',
      '${req.body.lastname.toUpperCase()}',
      '${req.body.gender}',
      '${req.body.phase.toString().toUpperCase()}',
      '${req.body.block.toString().toUpperCase()}',
      '${req.body.lot.toString().toUpperCase()}',
      '${req.body.street.toString().toUpperCase()}',
      '${ req.body.contactno}',
      '${req.body.username.toUpperCase()}','${newpassword}'
      )
    `;
    dbCon.query(sql, function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    });
  } else {
    let readsql = `select * from tbl_accounts where username = '${req.body.username}'`;
    dbCon.query(readsql, function (error, data, fields) {
      if (error) throw error;
      if (data[0].password == req.body.password)
        newpassword = req.body.password;
      sql = `update tbl_accounts set 
      position_id='${ req.body.position_id}' , 
      profile_img='${ req.body.profile_img}',
      firstname='${req.body.firstname.toUpperCase()}',
      lastname='${req.body.lastname.toUpperCase()}',
      phase='${req.body.phase.toUpperCase()}',
      block='${req.body.block.toUpperCase()}',
      lot='${req.body.lot.toUpperCase()}',
      street='${req.body.street.toUpperCase()}',
      gender='${req.body.gender}',
      contactno='${req.body.contactno}',password='${newpassword}'  
      where user_id = ${req.body.user_id}
      `;
      dbCon.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.send(results);
      });
    });
  }
  // console.log(sql);
});
router.post("/insertUpdatePosition", (req, res) => {
  let sql = "";
  if (req.body.index == -1) {
    sql = `insert into tbl_positions
    (position)
    values
    ('${req.body.position}')
    `;
  } else {
    sql = `update tbl_positions set position='${req.body.position}' where position_id=${req.body.position_id}`;
  }
  dbCon.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});

router.post("/loginAccount", (req, res) => {
  let sql = `select * from tbl_accounts A inner join tbl_positions B on A.position_id = B.position_id where username ='${req.body.username}'`;
  dbCon.query(sql, function (error, results, fields) {
    if (error) throw error;
    let isTrue = false;
    if (results.length > 0) {
      isTrue = md5(req.body.password) == results[0].password ? true : false;
    }
    res.send({ users: results, password: isTrue });
  });
});

router.get("/loadAccounts", (req, res) => {
  let sql =
    "SELECT * FROM tbl_accounts A  inner join tbl_positions B on A.position_id = B.position_id WHERE A.isBan=0";
  dbCon.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});

module.exports = router;
