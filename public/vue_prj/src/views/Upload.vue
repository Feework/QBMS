<template>
  <div class="add-file-right">
    <el-form enctype="multipart/form-data">
      <span>课程：</span>
      <el-select id="courses" style="width: 120px" v-model="model1" @change="$forceUpdate()">
        <el-option v-for="item in courses_list" :value="item" :key="item">{{ item }}</el-option>
      </el-select>
      <el-button type="primary" @click="propagate" class="choice_style">选择文件</el-button>
      <input type="file" ref="refFile" style="display: none" id="upload" @change="fileLoad($event)" accept=".docx,.doc,.pdf,.txt">
      <el-input placeholder="文件" class="file_name_style" readonly="readonly" id="file_path" ></el-input>
      <el-button type="primary" @click="upload()" class="upload_style">导入</el-button>
    </el-form>
  </div>
</template>

<script>

export default {
  name: "upload",
  data () {
    return {
      courses_list: [
        "aaa","bbb"
      ],
      model1: ''
    }
  },
  created() {
    this.axios
      .post(
        "/manager/upload_init"
      )
      .then(response => {
        let res_list = response.data.res_list;
        this.courses_list = res_list
        console.log(this.courses_list)
      });
  },
  methods: {
    propagate: function () {
      document.getElementById("upload").click();
    },
    fileLoad(e) {
      var files = this.$refs.refFile.files[0];
      var name = files.name; //选中文件的文件名
      var size = files.size; //选中文件的大小
      document.getElementById("file_path").value = "文件名:" + name + "大小:" + size;
    },
    upload: function () {
      if(0 == this.$refs.refFile.files.length){
        this.$message({
          type: 'info',
          message: '请选择要上传的文件'
        });
        return;
      }
      if('' == this.model1){
        this.$message({
          type: 'info',
          message: '请选择对应课程'
        });
        return;
      }
      var files = this.$refs.refFile.files[0];
      var formData = new FormData();
      var course = this.model1;
      formData.append('filename',files.name);
      formData.append('fileUpload',files);
      formData.append('course',course);
      console.log(course)
      this.axios
        .post("manager/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(response => {
          let res = response.data;
          console.log(res.status)
          if (res.status === 0) {
            console.log("000")
            this.$message({
              showClose: true,
              message: "上传成功！",
              type: "success"
            });
          } else{
            console.log("111")
            this.$message({
              showClose: true,
              message: "上传失败！",
              type: "error"
            });
          }
          this.$router.push({
            path: "/Mainpage",
            query:{
              user_id: this.$route.query.user_id
            }});
        });
    },
  }
}
</script>

<style>
html {
  height: 100%;
}

body {
  background-color: #f7f7f7;
}

.add-file-right {
  height: 70px;
  margin: 0 auto;
  width:500px;
}

.file_name_style {
  width: 400px;
  margin: 10px auto;
  padding-bottom: 10px;
}

.choice_style {
  width: 100px;
  margin-bottom: 10px !important;
  background-color: #4e519e !important;
  border: #4e519e !important;
}

.upload_style {
  width: 270px;
  margin-bottom: 10px !important;
  background-color: #4e519e !important;
  border: #4e519e !important;
}

.el-button + .el-button {
  margin-left: 0px !important;
  margin-top: 20px;
}
</style>
