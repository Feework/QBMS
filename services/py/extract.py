from docx import Document
from openpyxl import Workbook
import pymysql
import sys

conn = pymysql.connect(host='localhost', user='root', password='123456', db='test', autocommit =True)
cur = conn.cursor()
# 获取游标
sql_init1 = """CREATE TABLE IF NOT EXISTS multiple_choice (
                question_id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT DEFAULT 0,
                content VARCHAR(400) NOT NULL,
                right_answer VARCHAR(30) DEFAULT 'NULL',
                resolve VARCHAR(500) DEFAULT 'NULL'
                )"""
sql_init2 = """CREATE TABLE IF NOT EXISTS choices(
                answer_id INT AUTO_INCREMENT PRIMARY KEY,
                content VARCHAR(400) NOT NULL,
                question_id INT NOT NULL,
                foreign key(question_id) references multiple_choice(question_id)
                )"""

sql_insert_mul = """INSERT INTO multiple_choice(content,resolve)
                SELECT %s,%s FROM DUAL WHERE NOT EXISTS(SELECT content FROM multiple_choice WHERE content = %s)
                """
sql_insert_choices = """INSERT INTO choices(content,question_id)
                VALUES (%s,%s)"""
sql_update_mul = """UPDATE multiple_choice SET right_answer = %s WHERE question_id = %s"""
# 从 word 中提取文件内容
# 提取题目以及对应正确答案
filename = sys.argv[1]
file = Document(filename)

number_of_titles = 0
numbers = "123456789"
alpha = "ABCDEFGH"
flag = True
titles_list = []
titles = []
ans = ""

cur.execute(sql_init1)
cur.execute(sql_init2)

tbs = file.tables
for tb in tbs:
    for row in tb.rows:
        for cell in row.cells:
            content = cell.text
            if content[0] in numbers:
                titles = []
                ans = ""
                resolve = ""
                lines = content.splitlines()
                for element in lines:
                    if "正确答案" in element:
                        ans = element
                    if "答案解析" in element:
                        resolve = element.replace('【答案解析】：', '', 1)
                name = lines[0].split('、', 1)[1].rstrip('。').replace("（　）", "").strip()
                titles.append(lines[0].split('、', 1)[1].rstrip('。').replace("（　）", "").strip())
                choices = []
                right_choices = []
                for i in range(1, len(lines)):
                    if len(lines[i]) >= 2 and lines[i][0] in alpha:
                        choices.append(lines[i].split('.', 1)[1].strip())
                if 'A' in ans:
                    content = lines[1].split('.', 1)[1].strip()
                    right_choices.append(content)
                    choices.remove(content)
                if 'B' in ans:
                    content = lines[2].split('.', 1)[1].strip()
                    right_choices.append(content)
                    choices.remove(content)
                if 'C' in ans:
                    content = lines[3].split('.', 1)[1].strip()
                    right_choices.append(content)
                    choices.remove(content)
                if 'D' in ans:
                    content = lines[4].split('.', 1)[1].strip()
                    right_choices.append(content)
                    choices.remove(content)
                if 'E' in ans:
                    content = lines[5].split('.', 1)[1].strip()
                    right_choices.append(content)
                    choices.remove(content)
                # choices中为错误答案，right中为正确答案
                if titles not in titles_list:
                    titles_list.append(titles)
                    insert = cur.execute(sql_insert_mul, (titles, resolve, titles))
                    if insert == 0:
                        break
                    index = cur.lastrowid
                    answer = ""
                    for i in right_choices:
                        insert = cur.execute(sql_insert_choices, (i, index))
                        answer = answer + str(cur.lastrowid) + ','
                    for i in choices:
                        insert = cur.execute(sql_insert_choices, (i, index))
                    update = cur.execute(sql_update_mul, (answer, index))
                break
        if not flag:
            break
    if not flag:
        break
cur.close()
conn.close()
print("insert success")
