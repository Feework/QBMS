var express = require('express');
var router = express.Router();
const userservice = require('./../services/userService')
const fileservice = require('./../services/fileService')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/index/login', userservice.signIn); /*用户登录检验接口*/
router.post('/index/signup', userservice.signUp); /*用户注册接口*/
router.post('/manager/upload', fileservice.upLoad); /*管理员导入题目接口*/
router.post('/manager/upload_init', fileservice.course_init); /*课程显示初始化接口*/
router.post('/paper/create',fileservice.paper_create); /*试卷生成接口*/


module.exports = router;
