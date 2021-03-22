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
                "   `user_id` INT AUTO_INCREMENT PRIMARY KEY,\n" +
                "   `user_name` VARCHAR(20) NOT NULL,\n" +
                "   `password` VARCHAR(12) NOT NULL,\n" +
                "   `role` int DEFAULT 0\n" +
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
    this.signUp = function (name,password, cb) {
            var sql = 'INSERT INTO user ' +
                '(password, user_name) ' +
                'values(?, ?);';
            var SqlParams = [password, name];
            connection.query(sql, SqlParams, function (err, result) {
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    return;
                }
                var sql1 = 'SELECT * FROM user ORDER BY user_id DESC LIMIT 1';
                connection.query(sql1,function (err, result) {
                    console.log(result);
                    if (err) {
                        console.log(err.message);
                        return;
                    }
                    if (cb != null) return cb(result[0].user_id);
                });

            });
    };
    this.getCourses = function (cb) {
        var sql = 'SELECT course_name FROM course';
        connection.query(sql,function (err, result) {
            if (err) {
                console.log(err.message);
                return;
            }
            res_list = []
            for (var i=0;i<result.length;i++)
            {
                res_list.push(result[i].course_name)
            }
            console.log(res_list);
            if (cb != null) return cb(res_list);
      });
    };
    this.getQuestions = function (course,cb) {
        var sql2 = 'select course_id from course where course_name = ?'
        var sql1 = 'select count(*) as count from multiple_choice where course_id = ?'
        var sql = 'select multiple_choice.question_id as question_id,multiple_choice.content as que_content,choices.content as ans_content,answer_id,resolve,right_answer from multiple_choice ,choices ' +
        'where multiple_choice.course_id = ? and choices.question_id = multiple_choice.question_id';
        connection.query(sql2,course,function (err, result2) {
            if (err) {
            console.log(err.message);
            return;
            }
            //获取course_id
            var course_id = result2[0].course_id
            connection.query(sql1,course_id,function (err, result) {
                if (err) {
                    console.log(err.message);
                    return;
                }
                que_num = result[0].count
                res_list = []
                connection.query(sql,course_id,function (err, result1) {
                    if (err) {
                        console.log(err.message);
                        return;
                    }
                    var i = 0;
                    for (var j=0;j<result1.length;j++)
                    {
                        i = result1[j].question_id;
                        var question = new Object();
                        question.question_id = result1[j].question_id
                        question.content = result1[j].que_content
                        question.resolve = result1[j].resolve
                        question.answer_list = []
                        question.right_answer = []
                        var right_answer_num = result1[j].right_answer.toString().slice(0,-1).split(',')
                        var answer_id = 1;
                        //打乱选项
                        var answers = []
                        while( 1 )
                        {
                            answers.push([result1[j].ans_content,result1[j].answer_id]);
                            if(j+1 >= result1.length || i !== result1[j+1].question_id) break;
                            j = j + 1;
                        }
                        answers.sort(randomsort)
                        for(var k =0;k<answers.length;k++)
                        {
                            question.answer_list.push([String.fromCharCode(answer_id + 64),answers[k][0]])
                            if(right_answer_num.indexOf(answers[k][1].toString()) !== -1){
                                question.right_answer.push(String.fromCharCode(answer_id + 64))
                            }
                            answer_id +=1 ;
                        }
                        res_list.push(question)
                    }
                    if (cb != null) return cb(res_list);
                })
          });

        });

    };
}

function randomsort(a, b) {
    //随机打乱数组
    return Math.random()>.5 ? -1 : 1;
}

module.exports = DB_helper;
