//db_helper全局 不用再次导入
exports.signIn = (req, res,next) => {
    console.log("signin");
    db_helper.signIn(req.body.account, req.body.pass, function (status, name, img_path) {
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
