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
              {{dataSource.userName}}
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
      <el-collapse v-model="answerCardActiveName">
        <el-collapse-item >
          <h2>选择题</h2><br></br>
          <el-button  class="answer-button" circle size="small" v-for="index of counts" :id="'answer'+index"  @click.native="jump(index)">{{index}}</el-button>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div ref="paperContent" class="paper-content">
      <div class="subject">
        <div class="subject-title" >
          <h2>选择题</h2><spn>（共 {{counts}} 题，合计 {{dataSource.totalScore}} 分）</spn>
        </div>
        <el-card class="box-card" v-for="(sub,index) in questions" :id="(index+1)">
          <div slot="header" class="clearfix">
            <el-tag effect="dark"> {{index}} </el-tag>
            <span>{{sub.title}}</span>
          </div>
          <el-checkbox-group  v-model="sub.examineAnswer">
            <el-checkbox :disabled="disabledAnswer" v-for="o in sub.answers" :label="o.no" class="answer-checkbox" @change="answerButtionCheck($event,sub)">{{o.no}}.{{o.answer}}</el-checkbox>
          </el-checkbox-group>
          <div v-if="type!==1" class="subject-remark">
            <div class="item">
              <span class="title">考生答案：</span>
              <span>{{converAnswerStr(sub.examineAnswer)}}</span>
            </div>
            <div class="item">
              <span class="title">正确答案：</span>
              <span>{{converAnswerStr(sub.correctAnswer)}}</span>
            </div>
            <div class="item">
              <span class="title">答案解析：</span>
              <span>{{sub.answerAnalysis}}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <div class="paper-footer">
      <el-button v-if="type===1" type="success" @click.native="btnClick('handPaper')">交卷</el-button>
      <el-button v-if="type===2" type="success" @click.native="btnClick('readPaper')">阅卷</el-button>
      <el-button v-if="type===2" type="success" @click.native="btnClick('readPaperUpper')">上一个</el-button>
      <el-button v-if="type===2" type="success" @click.native="btnClick('readPaperNext')">下一个</el-button>
    </div>
  </div>
</template>

<script>
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
          //分数
          score: '',
          //总分
          totalScore: 100,
          //考试时长(分钟)
          examDuration: 60,
          //科目
          course: '',
          //题目集合
          question: [
            {
              //数据库题号
              no: null,
              //题目
              title: '',
              //选项， A... B...
              answers: [
                {
                  //答案序号
                  no: '',
                  //答案
                  answer: ''
                }
              ],
              //考生答案
              examineAnswer: null,
              //正确答案
              correctAnswer: null,
              //答案解析
              answerAnalysis: '',
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
      //题目数
      counts: 10,
      //禁止答题
      disabledAnswer:false,
      //禁止阅卷
      disabledRead:false,
      //题目
      questions:[]
    }
  },
  created() {
    Object.assign(this.tempDataSource, this.dataSource)
    this.convertData()
    if(this.type===2)
    {
      this.disabledAnswer=true
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
    /**
     * 按钮点击事件
     */
    btnClick(type){
      console.log(this.tempDataSource);
      switch (type) {
        //交卷
        case 'handPaper':
          this.$emit('PaperHand',this.tempDataSource)
          break
        //阅卷
        case 'readPaper':
          this.$emit('paperRead',this.tempDataSource)
          break
        //阅卷 上一个
        case 'readPaperUpper':
          this.$emit('paperReadUpper')
          break
        //阅卷 下一个
        case 'readPaperNext':
          this.$emit('paperReadNext')
          break
      }
    },
    /**
     * 锚点定位
     */
    jump(postion) {
      let jump = this.$refs.paperContent.querySelectorAll("#"+postion);
      // 获取需要滚动的距离
      let total = jump[0].offsetTop;
      //实现form锚点定位
      this.$refs.paperContent.scrollTop = jump[0].offsetTop;
    },
    /**
     *对错选择 每有一个选项被选，就修改一次答案数组，最后遍历题目数组
     */
    isHookButtionCheck(val) {
      if(val.type===1 || val.type===2 || val.type===3)
      {
        if(val.isHook===1)
        {
          val.score=val.totalScore;
        }
        if(val.isHook===2)
        {
          val.score=0;
        }
      }
    },
    /**
     *答题卡选中
     */
    answerButtionCheck(value,parent,child){
      console.log(value,parent,child)
      let answerId='answer'+parent.code+child.no
      let but = this.$refs.paperLeft.querySelectorAll("#"+answerId);
      if(but.length>0)
      {
        if(but[0].className.indexOf('answer-button-check')>-1)
        {
          if(child.examineAnswer && child.examineAnswer.length==0){
            but[0].classList.remove("answer-button-check");
          }
        }
        else{
          if (child.examineAnswer && child.examineAnswer.length > 0) {
            but[0].classList.add("answer-button-check");
          }

        }

      }
    },
    /**
     * 转换答案
     */
    converAnswerStr(answer){
      if(answer instanceof Array)
      {
        return answer.join('  ')
      }
      return  answer
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
          self.disabledAnswer=true;
        }
        if (self.hour === 0) {
          if (self.minute !== 0 && self.second === 0) {
            self.second = 59
            self.minute -= 1
          } else if (self.minute === 0 && self.second === 0) {
            self.second = 0
            self.$emit('countDowmEnd', true)
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
  overflow: hidden
}

.paper-header {
  width: 100%;
  height: 60px;
  background-color: #f7f7f7;
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
  top: 60px;
  bottom: 0;
  width: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid #e4e4e4;
  border-top: none;
}

.paper-content {
  position: absolute;
  left: 305px;
  top: 60px;
  right: 0px;
  bottom: 45px;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #e4e4e4;
  border-top: none;
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
  padding-left: 10px;
  width: 100%;
  height: 45px;
  line-height: 45px;
  background: #f7f7f7;
}

.paper-title h1 {
  font-size: 1.2em;
  margin: 0;
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
  margin-left: 10px;
  width: 30px;
  height: 30px;
}
.answer-button:hover{
  background: #ecf1ef;
  border-color: #e4e4e4;
  color: #0a0a0a;
}
.answer-button-check{
  background: #13ce66;
  border-color: #30B08F;
}

.answer-radio{
  display: list-item;
  margin: 5px 0px;
}

.answer-checkbox{
  display: list-item;
  margin: 5px 0px;
}

.subject-title{
  padding-left: 10px;
  width: 100%;
  height: 45px;
  line-height: 45px;
  background: #f7f7f7;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .1);
  -webkit-box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .1);
}
.subject-title h2{
  font-size: 16px;
  display: inline-block;
}
.subject-title span {
  font-size: 16px;
  display: inline-block;
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
.el-radio>>>.el-radio__input.is-checked .el-radio__inner {
  background-color: #13ce66;
  border-color: #13ce66;
}

.el-radio-button>>>.el-radio-button__inner {
  padding: 10px;
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
}

.el-card{
  margin: 10px;
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
</style>

