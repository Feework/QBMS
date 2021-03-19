<template>
  <div class="button_list">
    <el-form enctype="multipart/form-data">
      <el-button type="primary" @click="skip_upload()" class="skip_style">题目导入</el-button>
      <el-button type="primary" @click="skip_paper()" class="skip_style">试卷</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Mainpage",
  methods: {
    skip_upload() {
      this.$router.push({ path: "/upload" });
    },
    skip_paper() {
      this.$router.push({ path: "/paper" });
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
</style>
