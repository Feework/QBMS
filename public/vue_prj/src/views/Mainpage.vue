<template>
  <div class="button_list">
    <div class="title_part" v-if="isShow">
      <h1>管理员界面</h1>
    </div>
    <div class="title_part" v-if="!isShow">
      <h1>用户界面</h1>
    </div>
    <el-form enctype="multipart/form-data">
      <el-button type="primary" @click="skip_upload()" class="skip_style" v-show="isShow">题目导入</el-button>
      <el-button type="primary" @click="skip_paper()" class="skip_style">试卷</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Mainpage",
  data(){
    return {
      isShow: false,
      user_id: ''
    }
  },
  created() {
    this.user_id = this.$route.query.user_id;
    if (this.$route.query.user_id != null && this.$route.query.user_id == '000001')
    {
      console.log("manager")
      this.isShow = true;
    }
  },
  methods: {
    skip_upload() {
      this.$router.push({ path: "/upload",
        query:{
          user_id: this.user_id
        } },
      );
    },
    skip_paper() {
      this.$router.push({ path: "/paper" ,
        query:{
        user_id: this.user_id
      }});
    }
  }
}
</script>

<style scoped>
html {
  height: 100%;
}

body {
  background-color: #f7f7f7;
}

.skip_style {
  width: 270px;
  margin-bottom: 10px !important;
  background-color: #4e519e !important;
  border: #4e519e !important;
}

.button_list {
  margin: 0 auto;
  width:300px
}

.el-button + .el-button {
  margin-left: 0px !important;
  margin-top: 20px;
}
.title_part {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 40px;
}
</style>
