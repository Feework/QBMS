var formidable = require('formidable');
const fs = require("fs");
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
        a = files.fileUpload.path
        b = form.uploadDir + generateFilename(oldFilename)
        fs.rename(files.fileUpload.path, form.uploadDir + generateFilename(oldFilename),err=>{
            if(err) {
                console.log("重命名失败");
                console.log(err);
            }else{
                console.log("重命名成功!");
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
