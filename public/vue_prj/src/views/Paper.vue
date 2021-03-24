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
      <el-table
        :row-style="{height:'45px'}"
        :cell-style="{padding:'0px'}"
        class="tb"
        ref="multipleTable"
        :data="tableData"
        @select="selectChange"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        :header-cell-style="{background:'#F4F4F4'}"
        border>
        <el-table-column type="selection"  width="50" ></el-table-column>
        <el-table-column prop="paper_name" label="试卷" width="180"></el-table-column>
        <el-table-column prop="paper_id" label="试卷id" v-if="false"></el-table-column>
      </el-table>
      <el-button type="primary" @click="open_paper()" class="right_button">打开试卷</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Paper",
  data () {
    return {
      tableData: [{
        paper_name: '试卷1',
        paper_id: 1
      },{
        paper_name: '试卷2',
        paper_id: 2
      }],
      handleSelectionList:[],
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
    this.axios
      .post(
        "/paper/get_paper_list"
      )
      .then(response => {
        this.tableData = response.data.res_list;
        console.log(this.tableData)
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
    },
    open_paper() {
      console.log("length" + this.handleSelectionList.length)
      if(0 == this.handleSelectionList.length) {
        this.$message({
          type: 'info',
          message: '请选择试卷'
        });
        return;
      }
      this.$router.push({ path: "/paperdisplay" ,
        query:{
          paper_id : this.handleSelectionList[0].paper_id,
          paper_name : this.handleSelectionList[0].paper_name,
        }});
    },
    handleSelectionChange(value) {
      this.handleSelectionList = value
      console.log(this.handleSelectionList)
    },
    selectChange(selection, row) {
      if (selection.length > 1) {
        const del_row = selection.shift()
        this.$refs.multipleTable.toggleRowSelection(del_row, false)
      }
    },
    // 点击行触发，选中或不选中复选框
    handleRowClick(row, column, event) {
      this.$refs.multipleTable.toggleRowSelection(row)
      this.selectChange(this.handleSelectionList)
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

/deep/ .el-table__header-wrapper  .el-checkbox{
  display:none
}

.tb{
  width: 232px;
  height: 409px;
  overflow: auto;
}

.right_button{
  width: 150px;
  background-color: #4e519e !important;
  border: #4e519e !important;
  position: absolute;
  bottom: 280px;
  margin-left: 50px;
}

</style>
