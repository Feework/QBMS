//db_helper全局 不用再次导入
var formidable = require('formidable');
exports.signIn = (req, res,next) => {
    console.log("signin");
    var user_id = parseInt(req.body.account);
    db_helper.signIn(user_id, req.body.pass, function (status, name) {
        //status:: 0: verified ; 1:not exists ; 2:verification error
        if (status === 0) {
            res.json({
                status: '0',
                name: name,
            });
            return;
        }
        else if (status === 1) {
            res.json({
                status: '1'
            });
            return;
        }
        else {
            res.json({
                status: '2'
            });
            return;
        }
    });
}
exports.signUp = (req, res,next) => {
    console.log("signUp");
    db_helper.signUp(req.body.name, req.body.pass, function (user_id) {
        res.json({
            user_id: user_id
        });
        return;
    });
}
exports.upLoad = (req, res,next) => {
    console.log("upLoad");
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = './public/files';
    form.keepExtensions = true
    form.parse(req, function(err, fields, files){
        console.log('received fields:');
        console.log(fields);   // { name: '张三丰', email: 'dianziyouxiang@163.com' }
        console.log('received files:');
        console.log(files);   // 上传的图片对象
        res.json({
            status: 0
        });
    })
}
