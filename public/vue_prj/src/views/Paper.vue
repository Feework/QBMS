<template>
  <div>
    <div class="left">
      <h2>自动组卷</h2>
      <span>题数：</span>
      <el-select id="counts" style="width: 120px" v-model="countsSelect" @change="$forceUpdate()">
        <el-option :value="20"></el-option>
        <el-option :value="25"></el-option>
        <el-option :value="50"></el-option>
      </el-select><br>
      <span>课程：</span>
      <el-select id="courses" style="width: 120px; margin-top: 20px" v-model="courseSelect" @change="$forceUpdate()">
        <el-option v-for="item in courses_list" :value="item" :key="item">{{ item }}</el-option>
      </el-select><br>
      <el-button type="primary" @click="skip_paper()" class="button_style">生成试卷</el-button>
    </div>
    <div class="right">
      <h2>历史试卷</h2>
      <el-button type="primary" @click="skip_upload()" class="skip_style">历史试卷</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Paper",
  data () {
    return {
      courses_list: [
        "aaa","bbb"
      ],
      courseSelect: '',
      countsSelect: ''
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
    skip_paper() {
      if('' == this.countsSelect){
        this.$message({
          type: 'info',
          message: '请选择题目数'
        });
        return;
      }
      if('' == this.courseSelect){
        this.$message({
          type: 'info',
          message: '请选择课程'
        });
        return;
      }
      this.$router.push({ path: "/paperdisplay" ,
      query:{
        counts: this.countsSelect,
        course: this.courseSelect
      }});
    }
  }
}
</script>

<style scoped>
.left {
  position: absolute;
  padding: 10px;
  left: 100px;
  top: 60px;
  bottom: 60px;
  width: 400px;
  border: 3px solid #e4e4e4;
}
.right {
  position: absolute;
  padding: 10px;
  top: 60px;
  bottom: 60px;
  width: 400px;
  border: 3px solid #e4e4e4;
  margin-left: 700px;
}
.button_style {
  width: 270px;
  margin-top: 20px;
  margin-bottom: 10px !important;
  background-color: #4e519e !important;
  border: #4e519e !important;
}
</style>
