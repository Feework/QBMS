<template>
  <div class="main_signup">
    <div class="logo_part">
      <span>题库</span>
    </div>
    <div class="form_container_signup">
      <el-form :model="users" :rules="Signup_FormRules">
        <el-form-item prop="name" class="input_style_signup">
          <el-input placeholder="请输入昵称(20位以内)" v-model="users.name" clearable></el-input>
        </el-form-item>
        <el-form-item prop="password" class="input_style_signup">
          <el-input placeholder="请输入密码(8-12位的字母数字组合)" v-model="users.password" show-password></el-input>
        </el-form-item>
        <el-form-item prop="passwords" class="input_style_signup">
          <el-input placeholder="请再次确认密码" v-model="users.passwords" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="signup" class="logon_style">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
const PasswordReg = /^\w{8,12}$/;

export default {
  name: "signUp",
  data() {
    var PasswordMainRule = (rule, value, callback) => {
      if (!PasswordReg.test(value)) {
        this.has_error = true;
        callback(new Error("密码必须为8到20以内的字母或数字或下划线组合！"));
      } else {
        callback();
      }
    };
    var PasswordsRule = (rule, value, callback) => {
      if (value !== this.users.password) {
        this.has_error = true;
        callback(new Error("确认密码必须与新密码相同！"));
      } else {
        callback();
      }
    };
    return {
      users: {
        account: "",
        name: "",
        password: "",
        passwords: "",
      },
      has_error: false,
      Signup_FormRules: {
        name: [
          { required: true, message: "昵称必填！", trigger: "blur" },
          {
            min: 1,
            max: 20,
            message: "昵称长度必须在20以内！",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "密码必填！", trigger: "blur" },
          { validator: PasswordMainRule, trigger: "blur" }
        ],
        passwords: [
          { required: true, message: "确认密码必填！", trigger: "blur" },
          { validator: PasswordMainRule, trigger: "blur" },
          { validator: PasswordsRule, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    signup: function() {
      if (this.has_error) {
        return;
      }
      this.axios
        .post(
          "index/signup",
          this.qs.stringify({
            name: this.users.name,
            pass: this.users.password
          })
        )
        .then(response => {
          var id = response.data.user_id + ''
          this.$message({
            showClose: true,
            message: "注册成功！账号为："+id.padStart(6,'0'),
            type: "success"
          });
          this.$router.push({ path: "/Login" });
        });
    },
    backToLogin: function() {
      window.location.href = "";
    }
  }
};
</script>

<style>
html {
  height: 100%;
}

body {
  background-color: #f7f7f7;
}

.main_signup {
  text-align: center;
  margin-top: 90px;
}

.form_container_signup {
  background-color: white;
  width: 350px;
  height: 430px;
  margin: auto;
  border-radius: 5px;
  margin-top: 10px;
  padding-top: 20px;
  box-shadow: 2px 2px rgb(233, 233, 233);
}


.upload_icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #4e519e;
  font-size: 1.5em;
  opacity: 0;
}

#profile {
  height: 80px;
  width: 80px;
  border-radius: 50%;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
}

#profile:hover {
  opacity: 0.4;
  cursor: pointer;
}

#profile:hover + .upload_icon {
  opacity: 1;
}

.input_style_signup {
  width: 270px !important;
  margin: 10px auto;
  padding-bottom: 5px;
}

.logon_style {
  width: 270px;
  background-color: #4e519e !important;
  border: #4e519e !important;
}

#close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

#close-btn:hover {
  cursor: pointer;
}
</style>
