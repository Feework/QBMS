<template>
  <div class="paper-main">
    <div class="paper-header">
      <el-form label-position="top" label-width="100px" :model="tempDataSource" style="padding-top:0px; ">
        <el-row>
          <el-col :span="4" :offset="1">
            <el-form-item label="试卷">
              {{dataSource.paperName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="考生">
              {{dataSource.userId}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="总分">
              100
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="分数" v-if="this.type===2">
              {{dataSource.score}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="考试时长">
              {{dataSource.examDuration}}分
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="this.type===1">
            <el-form-item label="倒计时间">
              <span class="downTime">{{hour? hourString+':'+minuteString+':'+secondString : minuteString+':'+secondString}}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div ref="paperLeft" class="paper-left">
      <div class="paper-title">
        <h1><i class="el-icon-s-grid"></i>答题卡</h1>
      </div>
      <el-collapse v-model="answerCardActiveName" class="answer-title">
        <el-collapse-item >
          <h2 style="width: 500px">选择题</h2>
          <el-button class="answer-button" circle size="small" v-for="index of dataSource.counts" :id="'answer'+(index)"  @click.native="jump(index)">{{index}}</el-button>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div ref="paperContent" class="paper-content">
      <div class="subject">
        <div class="subject-title" >
          <h2>选择题</h2><span>（共 {{dataSource.counts}} 题，合计 {{dataSource.totalScore}} 分）</span>
        </div>
        <el-card class="box-card" v-for="ques in dataSource.question" :id="(ques.no)" ref="(ques.no)">
          <div slot="header" class="clearfix">
            <span class="que_title"> {{ques.no}}.{{ques.title}}</span>
          </div>
          <el-checkbox-group  v-model="ques.examineAnswer">
            <el-checkbox :disabled="type!==1" class="answer-checkbox" v-for="ans in ques.answers" :label="ans.no">{{ ans.no }}.{{ans.answer}}</el-checkbox>
          </el-checkbox-group>
          <div v-if="type!==1" class="subject-remark">
            <div class="item">
              <span class="title">是否正确：</span>
              <span v-if="ques.isHook">正确  </span>
              <span v-if="!ques.isHook">错误  </span>
              <span class="title">得分：</span>
              <span>{{ques.score}}</span>
            </div>
            <div class="item">
              <span class="title">考生答案：</span>
              <span>{{ques.examineAnswer}}</span>
            </div>
            <div class="item">
              <span class="title">正确答案：</span>
              <span>{{ques.correctAnswer}}</span>
            </div>
            <div class="item">
              <span class="title">答案解析：</span>
              <span>{{ques.answerAnalysis}}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <div class="paper-footer">
      <el-button v-if="type===1" class="hand_button" @click="handpaper" id="hand">交卷</el-button>
    </div>
  </div>
</template>

<script>
function scalarArrayEquals(array1,array2) {
  return array1.length==array2.length && array1.every(function(v,i) { return v === array2[i]});
}
export default {
  name: 'examinationPaper',
  props: {
    //试卷类型 1 考试 2 阅卷
    type: {
      type: Number,
      default: 1
    },
    //数据源
    dataSource: {
      type: Object,
      default: () => {
        return {
          //试卷数据库ID
          paperId: '',
          //试卷名称，eg计算机_1
          paperName: '',
          //用户ID
          userId: '',
          //用户名
          userName: '',
          //最后得分
          score: '',
          //总分
          totalScore: 100,
          //考试时长(分钟)
          examDuration: 60,
          //试题数
          counts : 1,
          //科目
          course: '',
          //题目集合
          question: [
            {
              //题号
              no: 1,
              //数据库题号
              question_id : 305,
              //题目
              title: '提高系统可靠性的常用的技术不包括',
              //选项， A... B...
              answers: [
                // {
                //   //答案序号 A B...
                //   no: '',
                //   //数据库序号
                //   answer_id : '',
                //   //答案
                //   answer: ''
                // }
                {no: "A", answer_id: 1336, answer: "结构化设计技术"},
                {no: "B", answer_id: 1337, answer: "设备冗余技术"},
                {no: "C", answer_id: 1338, answer: "容错技术"},
                {no: "D", answer_id: 1339, answer: "负荷分布技术"}

      ],
              //考生答案
              examineAnswer: [],
              //正确答案
              correctAnswer: ["A"],
              //答案解析
              answerAnalysis: 'analysis',
              //是否对错  1.对 2.错
              isHook: null,
              //得分
              score: null
            }
          ]
        }
      }
    }
  },
  data() {
    return {
      //倒计小时
      hour: '',
      //倒计分钟
      minute: '',
      //倒计秒
      second: '',
      //计时器
      promiseTimer: '',
      //数据源
      tempDataSource: {},
      answerCardActiveName:''
    }
  },
  created() {
    this.type = 1;
    console.log(this.$route.query.paper_id == null)
    if(this.$route.query.paper_id != null){
      console.log("to get_paper_by_id" + this.$route.query.paper_id)
      this.dataSource.paperId = this.$route.query.paper_id;
      this.dataSource.paperName = this.$route.query.paper_name;
      this.axios
        .post(
          "/paper/get_paper_by_id",
          this.qs.stringify({
            paper_id: this.dataSource.paperId
          })
        )
        .then(response => {
          var temp_list = [];
          let res_list = response.data.res_list;
          this.dataSource.counts = res_list.length;
          this.dataSource.userId = response.data.user_id.toString().padStart(6,'0');
          for(var i = 0 ; i < res_list.length ; i++){
            var temp = new Object();
            temp.no = i+1;
            temp.question_id = res_list[i].question_id;
            temp.title = res_list[i].content;
            temp.answers = res_list[i].answer_list;
            temp.examineAnswer = [];
            temp.correctAnswer = res_list[i].right_answer;
            temp.answerAnalysis = res_list[i].resolve;
            temp.isHook = false;
            temp.score = 0;
            temp_list.push(temp);
          }
          this.dataSource.question = temp_list;
          //加载到试题列表
          console.log(this.dataSource.question);

        });
    }
    if(this.$route.query.paper_id == null)
    {
      console.log("createpaper")
      this.dataSource.course = this.$route.query.course;
      this.dataSource.counts = parseInt(this.$route.query.counts);
      this.axios
        .post(
          "/paper/create",
          this.qs.stringify({
            course: this.dataSource.course,
            counts: this.dataSource.counts,
            user_id: this.$route.query.user_id
          })
        )
        .then(response => {
          var temp_list = [];
          let res_list = response.data.res_list;
          for(var i = 0 ; i < res_list.length ; i++){
            var temp = new Object();
            temp.no = i+1;
            temp.question_id = res_list[i].question_id;
            temp.title = res_list[i].content;
            temp.answers = res_list[i].answer_list;
            temp.examineAnswer = [];
            temp.correctAnswer = res_list[i].right_answer;
            temp.answerAnalysis = res_list[i].resolve;
            temp.isHook = false;
            temp.score = 0;
            temp_list.push(temp);
          }
          this.dataSource.question = temp_list;
          this.dataSource.userId = response.data.user_id.toString().padStart(6,'0');
          this.dataSource.paperName = response.data.paper_name;
          //加载到试题列表
        });
    }

  },
  computed: {
    hourString () {
      return this.hour < 10 ? '0' + this.hour : '' + this.hour
    },
    minuteString () {
      return this.minute < 10 ? '0' + this.minute : '' + this.minute
    },
    secondString () {
      return this.second < 10 ? '0' + this.second : '' + this.second
    }
  },
  mounted () {
    if(this.type===1)
    {
      let remainTime=this.dataSource.examDuration*60;
      if (remainTime> 0) {
        this.hour = Math.floor((remainTime / 3600) % 24)
        this.minute = Math.floor((remainTime / 60) % 60)
        this.second = Math.floor(remainTime % 60)
        this.countDowm()
      }
    }

  },

  methods: {
    handpaper(){
      this.type = 2;
      var point = this.dataSource.totalScore / this.dataSource.counts;
      var total = 0;
      for(var i = 0; i < this.dataSource.question.length ; i++){
          if(scalarArrayEquals(this.dataSource.question[i].examineAnswer,this.dataSource.question[i].correctAnswer)){
            //正确
            this.dataSource.question[i].isHook = 1;
            this.dataSource.question[i].score = point;
            total += point;
          }
          else {
            //错误
            this.dataSource.question[i].isHook = 0;
            this.dataSource.question[i].score = 0;
            document.getElementById('answer'+(i+1)).style.backgroundColor = "red";
          }
      }
      this.dataSource.score = total;
    },
    /**
     * 锚点定位
     */
    jump(postion) {
      document.getElementById(postion).scrollIntoView({
        behavior: "smooth",  // 平滑过渡
        block:    "start"  // 上边框与视窗顶部平齐。默认值
      });
    },
    /**
     * 倒计时
     */
    countDowm () {
      let self = this
      clearInterval(this.promiseTimer)
      this.promiseTimer = setInterval(function () {
        if(self.hour===0 && self.minute===0 && self.second===0)
        {
          document.getElementById("hand").click();
        }
        if (self.hour === 0) {
          if (self.minute !== 0 && self.second === 0) {
            self.second = 59
            self.minute -= 1
          } else if (self.minute === 0 && self.second === 0) {
            self.second = 0
            clearInterval(self.promiseTimer)
          } else {
            self.second -= 1
          }
        } else {
          if (self.minute !== 0 && self.second === 0) {
            self.second = 59
            self.minute -= 1
          } else if (self.minute === 0 && self.second === 0) {
            self.hour -= 1
            self.minute = 59
            self.second = 59
          } else {
            self.second -= 1
          }
        }
      }, 1000)
    },
  }

}
</script>

<style scoped>
.paper-main {
  margin: 10px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}

.paper-header {
  width: 100%;
  height: 70px;
  background-color: #4e519e;
  position: absolute;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .1);
  -webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .1);
}

.paper-left {
  position: absolute;
  padding: 10px;
  left: 0;
  top: 70px;
  bottom: 0;
  width: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid #e4e4e4;
  border-top: none;
  background-color: #ffffff;
}

.paper-content {
  position: absolute;
  left: 305px;
  top: 70px;
  right: 0px;
  bottom: 45px;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #e4e4e4;
  border-top: none;
  background-color: #ffffff;
}

.paper-footer {
  position: absolute;
  padding: 5px 10px;
  left: 305px;
  right: 0;
  bottom: 0px;
  height: 45px;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #f7f7f7;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .1);
  -webkit-box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .1);
  text-align: center;
}

.paper-title {
  width: 95%;
  height: 45px;
  line-height: 45px;
  background: #f7f7f7;
}

.answer-title {
  width: 95%;
  text-align: left;
}

.paper-title h1 {
  font-size: 1.2em;
  margin: 0;
  background-color: #4e519e;
  color: #f7f7f7;
}

.downTime{
  color: rgb(230, 93, 110);
  font-size: 16px;
  font-weight: bold;
}
.answer-button{
  padding: 0px;
  color: #0a0a0a;
  background-color: #ffffff;
  border-color: #e4e4e4;
  margin-left: auto;
  margin-right: 20px;
  width: 30px;
  height: 30px;
}

.answer-checkbox{
  display: list-item;
  margin: 5px 0px;
  list-style-type: none;
}

.subject{
  padding-left:5px;
}

.subject-title{
  text-align:left;
  padding-left:10px;
  width: 98%;
  height: 45px;
  line-height: 45px;
  background: #4e519e;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .1);
  -webkit-box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .1);
}
.subject-title h2{
  font-size: 16px;
  display: inline-block;
  color: #f7f7f7;
}
.subject-title span {
  font-size: 16px;
  display: inline-block;
  color: #f7f7f7;
}

.subject-remark{
  background: #f7f7f7;
}
.subject-remark .item{
  display: block;
  padding: 5px;
}
.subject-remark .title{
  font-weight: bold;
}

.el-collapse-item h2 {
  width: 150px;
  font-size: 14px;
  display: inline-block;
}
.el-form--label-top >>> .el-form-item__label {
  float: none;
  display: inline-block;
  text-align: left;
  padding: 0px;
  color: #f7f7f7;
}
.el-form--label-top >>> .el-form-item__content {
  color: #f7f7f7;
}

.el-card >>>.el-card__header {
  background-color: #ffffff;
  padding: 0px 10px;
  line-height: 35px;
  font-size: 16px;
}
.el-card >>>.el-card__body {
  padding: 5px 20px;
}

.box-card {
  text-align: left;
  padding-left: 0px;
}

.el-button+.el-button{
  margin-top: 10px;
}

.hand_button{
  width: 170px;
  color: #f7f7f7;
  margin-bottom: 10px !important;
  background-color: #4e519e !important;
  border: #4e519e !important;
}

</style>

