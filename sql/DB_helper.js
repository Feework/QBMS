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
            var sql1="CREATE TABLE IF NOT EXISTS `paper`(\n" +
                "   `paper_id` INT AUTO_INCREMENT PRIMARY KEY,\n" +
                "   `paper_name` VARCHAR(100) NOT NULL,\n" +
                "   `user_id` INT NOT NULL,\n" +
                "   `course_id` INT NOT NULL,\n" +
                "   `question_num` INT NOT NULL,\n" +
                "   `question_list` VARCHAR(500) NOT NULL,\n" +
                "   `time` datetime NOT NULL,\n" +
                "   `points` int DEFAULT 100\n" +
                ");";
            connection.query(sql,function (err) {
                if(err){
                    console.log("[CREATE TABLE ERROR - ]",err.message);
                    return;
                }
            });
            connection.query(sql1,function (err) {
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
                            var temp = new Object();
                            temp.no = String.fromCharCode(answer_id + 64);
                            temp.answer_id = answers[k][1];
                            temp.answer = answers[k][0];
                            question.answer_list.push(temp)
                            if(right_answer_num.indexOf(temp.answer_id.toString()) !== -1){
                                question.right_answer.push(temp.no)
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
    this.addPaper = function (user_id,course,counts,ques_list,points, cb) {
            var sql = 'INSERT INTO paper ' +
                '(paper_name,user_id,course_id,question_num,question_list,time,points) ' +
                'values(?,?,?,?,?,?,?);';
            var sql1 = 'select course_id from course where course_name = ?'
            var sql2 = 'select count(*) as count from paper where course_id = ?'
            connection.query(sql1, course, function (err, result) {
                if (err) {
                    console.log( err.message);
                    return;
                }
                var course_id = result[0].course_id
                connection.query(sql2, course_id,function (err, result) {
                    console.log(result);
                    if (err) {
                        console.log(err.message);
                        return;
                    }
                    que_num = result[0].count
                    var paper_name = course + (que_num+1);
                    var date = new Date();
                    var time = date.toISOString().split('T')[0] + ' '
                            + date.toTimeString().split(' ')[0];
                    var SqlParams = [paper_name,user_id, course_id,counts,ques_list.toString(),time,points];
                    connection.query(sql,SqlParams,function (err, result) {
                        if (err) {
                            console.log(err.message);
                            return;
                        }
                        var sql3 = 'SELECT * FROM paper ORDER BY paper_id DESC LIMIT 1';
                        connection.query(sql3,function (err, result) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }
                            if (cb != null) return cb(result[0].paper_id,result[0].paper_name);
                        });
                    });

                });
            });
    };

    this.getqueslist = function (paper_id, cb) {
        var sql = "select course_id,question_list from paper where paper_id = ?"
        var sql1 = "select course_name from course where course_id = ?"
        connection.query(sql,paper_id,function (err, result) {
            if (err) {
                console.log(err.message);
                return;
            }
            connection.query(sql1,result[0].course_id,function (err, result1) {
                if (err) {
                    console.log(err.message);
                    return;
                }
                if (cb != null) return cb(result1[0].course_name,result[0].question_list);
            });

        });
    };

    this.getpaperlist = function (user_id,cb) {
        var sql = "select paper_id,paper_name from paper where user_id = ?"
        connection.query(sql,user_id,function (err, result) {
            if (err) {
                console.log(err.message);
                return;
            }
            var res = []
            for (var i =0 ; i < result.length ; i++)
            {
                var temp = new Object();
                temp.paper_id = result[i].paper_id;
                temp.paper_name = result[i].paper_name;
                res.push(temp);
            }
            if (cb != null) return cb(res);
        });
    }
}



function randomsort(a, b) {
    //随机打乱数组
    return Math.random()>.5 ? -1 : 1;
}

module.exports = DB_helper;
