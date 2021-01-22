const SQLConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'test',
    charset: 'UTF8MB4_GENERAL_CI'
};

function DB_helper() {
    var mysql = require('mysql');
    var connection = mysql.createConnection(SQLConfig);
    connection.connect(function(err){
        if(err){
            console.log("connection failed!");
            throw(err);
        }
    });
    //初始化建表语句
    this.createTables=function () {
            var sql="CREATE TABLE IF NOT EXISTS `user`(\n" +
                "   `user_id` VARCHAR(20) NOT NULL,\n" +
                "   `user_name` VARCHAR(20) NOT NULL,\n" +
                "   `password` VARCHAR(12) NOT NULL,\n" +
                "   `role` int DEFAULT 0, \n" +
                "   PRIMARY KEY ( `user_id` )\n" +
                ");";
            connection.query(sql,function (err) {
                if(err){
                    console.log("[CREATE TABLE ERROR - ]",err.message);
                    return;
                }
            });
    }
    this.signIn = function (user_id, password, cb) {
            var sql = 'SELECT * FROM user where user_id = ?';
            var SqlParams = [user_id, password];
            connection.query(sql, SqlParams, function (err, result) {
                console.log(result);
                if (err) {
                    console.log(err.message);
                    return;
                }
                var status;
                var name;
                console.log("pwd:" + password);
                if (result.length === 0) {
                    status = 1;
                } else if (result[0].password === password) {
                    status = 0;
                    name = result[0].name;
                } else {
                    status = 2;
                }
                console.log(status);
                console.log(name);
                if (cb != null) return cb(status, name);
            });
     };
}

module.exports = DB_helper;
