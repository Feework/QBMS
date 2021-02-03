<template>
  <div class="add-file-right" style="height:70px;margin-left:100px;margin-top:15px;">
    <el-form enctype="multipart/form-data">
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
      var files = this.$refs.refFile.files[0];
      var formData = new FormData();
      formData.append('filename',files.name);
      formData.append('fileUpload',files);
      this.axios
        .post("manager/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(response => {
          let res = response.data;
          if (res.status === "0") {
            this.$message({
              showClose: true,
              message: "上传成功！",
              type: "success"
            });
          } else if (res.status === "1") {
            this.$message({
              showClose: true,
              message: "上传失败！",
              type: "error"
            });
          }
        });
    }
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
}
</style>
