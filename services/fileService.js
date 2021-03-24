const formidable = require('formidable');
const fs = require("fs");
const readLine = require("readline")
const exec = require('child_process').exec;
exports.upLoad = (req, res,next) => {
    console.log("upLoad");
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = './public/files/';
    form.keepExtensions = true
    form.parse(req, function(err, fields, files){
        if(err) throw err;
        console.log(fields);
        var oldFilename = files.fileUpload.name;
        var newFilename = form.uploadDir + generateFilename(oldFilename)
        fs.rename(files.fileUpload.path, newFilename,err=>{
            if(err) {
                console.log("重命名失败");
                console.log(err);
            }else{
                console.log("重命名成功!");
                var cmdStr = 'python ./services/py/extract.py '+newFilename+' '+ fields.course;
                var cmdStr1 = 'python ./services/py/split.py '
                var cmdStr2 = 'python ./services/py/word2vec_kmeans.py '
                exec(cmdStr,function (err,stdout,stderr) {
                    if(err) {
                        console.log('error: ' + stderr);
                    } else {
                        console.log(stdout);
                        exec(cmdStr1,function (err,stdout,stderr) {
                            if(err) {
                                console.log('error: ' + stderr);
                            } else {
                                console.log(stdout);
                                exec(cmdStr2,function (err,stdout,stderr) {
                                    if(err) {
                                        console.log('error: ' + stderr);
                                    } else {
                                        console.log(stdout);

                                    }
                                })
                            }
                        })
                    }
                })
            }
        })

        res.json({
            status: 0
        });
    })
}
function generateFilename(oldFilename){
    //将老的文件名拼上时间戳，这样既不会命名冲突又可以看出文件的上传事件
    let d = new Date();
    let names = oldFilename.split(".");
    return `${ names[0]}_${ ""+d.getFullYear() + (d.getMonth()+1) + d.getDate() +'_'+ d.getHours() + d.getMinutes() + d.getSeconds()}.${ names[1]}`;
}

exports.course_init = (req, res,next) => {
    console.log("course_init");
    var cmdStr = 'python ./services/py/import_courses.py ';
    exec(cmdStr,function (err,stdout,stderr) {
        if(err) {
            console.log('error: ' + stderr);
        } else {
            console.log(stdout);
            // 初始化courses表
            db_helper.getCourses(function (res_list) {
                console.log("course_init");
                res.json({
                    res_list: res_list,
                });
                return;
            });
        }
    })

}

function randomsort(a, b) {
    //随机打乱数组
    return Math.random()>.5 ? -1 : 1;
}

exports.paper_create = (req, res,next) => {
    console.log("paper_create");
    var course = req.body.course;
    var counts = req.body.counts;
    var filename = "./services/py/cluster/out/tfidf_SC_out.txt";
    var fRead = fs.createReadStream(filename)
    var readObj = readLine.createInterface({input: fRead});
    //类别及对应索引
    var arr = []
    //得出的题目
    var quelist = []
    readObj.on('line',function (line){
        var a = line.slice(line.indexOf("[")+1,-1).split(',').sort(randomsort);
        arr.push(a);
    })
    fRead.on('end', ()=>{
        //文件读完 循环 每类取一道
        var i = 0 ;
        for(;;){
            for(var j =0;j<arr.length; j++)
            {
                if(arr[j].length != 0)
                {
                    quelist.push(parseInt(arr[j].shift()));
                    i += 1;
                    if(i == counts) break;
                }
            }
            if(i == counts) break;
        }
        //此处得到所需题号
        db_helper.addPaper(user_id,course,counts,quelist,100,function (paper_id,paper_name) {
            var resl = new Array(quelist.length)
            db_helper.getQuestions(course,function (res_list) {
                for(var k = 0 ; k < res_list.length;k++)
                {
                    if(quelist.indexOf(res_list[k].question_id) !== -1){
                        resl[quelist.indexOf(res_list[k].question_id)] = res_list[k];
                    }
                }
                console.log(quelist)
                console.log(resl)
                res.json({
                    res_list: resl,
                    paper_name: paper_name,
                    user_id: user_id
                });
                return;
            });
        });

    });
}

exports.get_paper_list = (req, res,next) => {
    console.log("get_paper_list");
    db_helper.getpaperlist(user_id,function (res_list) {
        res.json({
            res_list: res_list,
        });
        return;
    });

}

exports.get_paper_by_id = (req, res,next) => {
    console.log("get_paper_by_id")
    var paper_id = req.body.paper_id;
    db_helper.getqueslist(paper_id,function (course,question_list){
        var quelist = question_list.split(",");
        var resl = new Array(quelist.length)
        db_helper.getQuestions(course,function (res_list) {
            for(var k = 0 ; k < res_list.length;k++)
            {
                if(quelist.indexOf(res_list[k].question_id.toString()) !== -1){
                    resl[quelist.indexOf(res_list[k].question_id.toString())] = res_list[k];
                }
            }
            console.log(quelist)
            console.log(resl)
            res.json({
                res_list: resl,
                user_id: user_id
            });
            return;
        });

    });
}
