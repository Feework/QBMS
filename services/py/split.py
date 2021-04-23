# 分词
from jieba import lcut
import re
import pymysql
import sys

conn = pymysql.connect(host='localhost', user='root', password='123456', db='test', autocommit =True)
cur = conn.cursor()
sql_get_title = """SELECT * FROM multiple_choice WHERE course_id = %s"""
sql_get_ans = """SELECT * FROM choices WHERE answer_id = %s"""
sql_get_course = """SELECT course_id FROM Course WHERE course_name = %s"""
course = sys.argv[1]
# 加载停用词库
stop_f = open('./services/py/cluster/stop_words.txt', "r", encoding='utf-8')
stop_words = list()
for line in stop_f.readlines():
    line = line.strip()
    if not len(line):
        continue
    stop_words.append(line)

cur.execute(sql_get_course, course)
course_id = cur.fetchone()
cur.execute(sql_get_title,course_id)
result = cur.fetchall()
# 使用 jieba 进行分词
str_list = list()
for row in result:
    out_str = ''
    data_ans = ''
    data_title = row[2]
    ans = str(row[3]).split(",")
    for i in range(0, len(ans)-1):
        cur.execute(sql_get_ans, ans[i])
        data_ans = data_ans + "#" + cur.fetchone()[1]
    word_list = lcut(data_title, cut_all=False) + lcut(data_ans, cut_all=False)
    #结巴分词 去掉停用词、数字、百分数、小数、单字
    for word in word_list:
        if word not in stop_words:
            if word.isdigit() == False and re.search('([0-9.]+)%', word) == None and re.search('[0-9]{1,}[.][0-9]*', word) == None and len(word) != 1:
                if word != '\t':
                    out_str += word.lower()
                    out_str += ' '
    str_list.append(out_str)

# 将分词结果保存至txt文档，方便后面的提取和分析
filename = "./services/py/cluster/" + course + "_data_cut.txt"
with open(filename, "w+", encoding='utf-8') as fw:
    for element in str_list:
        element.encode('utf-8')
        data = element.strip()
        if len(data) != 0:
            fw.write(data)
            fw.write("\n")

stop_f.close()
fw.close()
