var express = require('express');
var router = express.Router();
const service = require('./../services/userService')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/index/login', service.signIn); /*用户登录检验接口*/
router.post('/index/signup', service.signUp); /*用户注册接口*/

module.exports = router;
