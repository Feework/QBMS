import pymysql
import sys

# 导入课程列表

conn = pymysql.connect(host='localhost', user='root', password='123456', db='test', autocommit =True)
cur = conn.cursor()
# 获取游标
sql_init = """CREATE TABLE IF NOT EXISTS Course (
                course_id INT AUTO_INCREMENT PRIMARY KEY,
                course_name VARCHAR(50) NOT NULL
                )"""

sql_insert = """INSERT INTO Course(course_name)
                SELECT %s FROM DUAL WHERE NOT EXISTS(SELECT course_name FROM Course WHERE course_name = %s)
                """

cur.execute(sql_init)
course_list = ['计算机', '语文', '数学', '英语']
for i in course_list:
    insert = cur.execute(sql_insert, (i, i))

cur.close()
conn.close()
print("import success")


