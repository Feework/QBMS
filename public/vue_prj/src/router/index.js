import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Login from '@/views/Login'
import Signup from "@/views/Signup";
import Upload from "@/views/Upload"
/*路径和显示的界面 import.vue界面，下方设定访问界面的路径*/
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/login',
      name: '登录',
      component: Login
    },
    {
      path: '/signup',
      name: '注册',
      component: Signup
    },
    {
      path: '/upload',
      name: '上传题目',
      component: Upload
    }
  ]
})



