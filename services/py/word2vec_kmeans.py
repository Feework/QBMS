# -*- coding: utf-8 -*-
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from gensim.models import Word2Vec
from gensim.models import word2vec
import matplotlib.pyplot as plt

outputDir = "./services/py/cluster/out/"  # 结果输出地址
filename = "./services/py/cluster/data_cut.txt"
corpus = []
f = open(filename, 'r', encoding='utf-8')  # 语料库 按题读入成[]\
for line in f.readlines():
    line = line.strip('\n')
    corpus.append(line)
save_model_name = './services/py/cluster/word2vec.model'
size = 150

def countIdf(corpus):
    vectorizer = CountVectorizer() #该类会将文本中的词语转换为词频矩阵，矩阵元素a[i][j] 表示j词在i类文本下的词频
    transformer = TfidfTransformer()  # 该类会统计每个词语的tf-idf权值
    tfidf = transformer.fit_transform(
        vectorizer.fit_transform(corpus))  # 第一个fit_transform是计算tf-idf，第二个fit_transform是将文本转为词频矩阵
    words = vectorizer.get_feature_names()  #获取所有词语
    weight = tfidf.toarray()  # 将tf-idf矩阵抽取出来，元素a[i][j]表示j词在i类文本中的tf-idf权重
    return weight, words

def Kmeans_SSE(weight, start_k = 2, end_k = 20):
    #手肘法 (权值，k值范围)
    SSE = []
    SSE_d1 = []  # sse的一阶导数
    SSE_d2 = []  # sse的二阶导数
    models = []  # 保存每次的模型
    for i in range(start_k, end_k):
        kmeans_model = KMeans(n_clusters=i)
        kmeans_model.fit(weight)
        SSE.append(kmeans_model.inertia_)  # 保存每一个k值的SSE值
        print('{} Means SSE loss = {}'.format(i, kmeans_model.inertia_))
        models.append(kmeans_model)
    X = range(start_k, end_k)
    # 用图进行观察 手肘法
    plt.xlabel('k')
    plt.ylabel('SSE')
    plt.plot(X, SSE, 'o-')
    plt.show()
    # 求二阶导数，最大值处为拐点，通过sse方法计算最佳k值
    SSE_length = len(SSE)
    for i in range(1, SSE_length):
        SSE_d1.append((SSE[i - 1] - SSE[i]) / 2)
    for i in range(1, len(SSE_d1) - 1):
        SSE_d2.append((SSE_d1[i - 1] - SSE_d1[i]) / 2)
    clusters = SSE_d2.index(max(SSE_d2))+1+start_k
    print("手肘法选取最佳K值" + str(clusters))

    y = models[SSE_d2.index(max(SSE_d2)) + 1].fit_predict(weight)
    #此处已经进行预测，y中为对应的类，如四个类，【0，0，1，2，3...】
    result = []
    for i in range(0, clusters):
        label_i = []
        for j in range(0, len(y)):
            if y[j] == i:
                label_i.append(j+1)
        result.append('类别' + '(' + str(i) + ')' + ':' + str(label_i))
    return result, clusters

def Kmeans_SC(weight, start_k = 2, end_k = 20):
    #轮廓系数法 （权值，范围）
    scores = []
    models = []  # 保存每次的模型
    for i in range(start_k, end_k):
        kmeans_model = KMeans(n_clusters=i)
        kmeans_model.fit(weight)
        score = silhouette_score(weight, kmeans_model.labels_, metric='euclidean')
        scores.append(score)  # 保存每一个k值的score值, 在这里用欧式距离
        print('{} Means score loss = {}'.format(i, score))
        models.append(kmeans_model)
    clusters = scores.index(max(scores)) + start_k
    print("轮廓系数法选取最佳K值" + str(clusters))

    y = models[scores.index(max(scores))].fit_predict(weight)
    #此处已经进行预测，y中为对应的类，如四个类，【0，0，1，2，3...】
    result = []
    for i in range(0, clusters):
        label_i = []
        for j in range(0, len(y)):
            if y[j] == i:
                label_i.append(j+1)
        result.append('类别' + '(' + str(i) + ')' + ':' + str(label_i))
    return result, clusters

def output(result, outputDir, clusters, title):
    outputFile = title + 'out'
    type = '.txt'
    count = 0
    while (os.path.exists(outputDir + outputFile + type)):
        count += 1
        outputFile = title + 'out' + str(count)
    doc = open(outputDir + outputFile + type, 'w')
    for i in range(0, clusters):
        print(result[i], file=doc)
    doc.close()

def sort_tfidf():
    sorted_words_list = list()
    for i in range(len(weight)):
        words_dict = dict()
        sorted_words = list()
        for j in range(len(words)):
            if weight[i][j] != 0:
                words_dict[words[j]] = weight[i][j]
        # 建立每一句话中tfidf的值词典
        sorted_words = sorted(words_dict.items(), key=lambda x: x[1], reverse=True)  # 将每句话中的单词按照权重值进行排序
        sorted_words_list.append(sorted_words)
    return sorted_words_list

def buildw2v():
    # 判断训练的模型文件是否存在
    # if not os.path.exists(save_model_name):  # 模型训练
    #     sentences = word2vec.Text8Corpus(filename)  # 加载语料
    #     model = Word2Vec(sentences, size=size, min_count=1)  # 训练skip-gram模型
    #     model.save(save_model_name)
    #     # 二进制类型保存模型 后续直接使用
    #     model.wv.save_word2vec_format(save_model_name + ".bin", binary=True)
    # else:
    #     print('此训练模型已经存在，不用再次训练')
    # 暂每次重新生成
    sentences = word2vec.Text8Corpus(filename)  # 加载语料
    model = Word2Vec(sentences, size=size, min_count=1)  # 训练skip-gram模型
    model.save(save_model_name)
    # 二进制类型保存模型 后续直接使用
    model.wv.save_word2vec_format(save_model_name + ".bin", binary=True)

def getvec():
    # 加载模型
    model = Word2Vec.load(save_model_name)
    print(model)
    keys = model.wv.vocab.keys()
    wordvector = []
    for key in keys:
        wordvector.append(model[key])
    count_list = []
    sentence_vector_list = []
    for element in sorted_words_list:
        # 这里就可以有不同累加法，这里采用的就是对整句话的tfidf值进行排序，最多取前20个 句向量200维
        sentence_vector = np.zeros(size)
        count = 0
        for i in range(len(element)):
            if i < 20:
                a, b = element[i][0], element[i][1]
                c = np.array(model[a])
                sentence_vector = sentence_vector + np.array(model[element[i][0]]) * element[i][1]
                count = count + 1
            else:
                break
        sentence_vector_list.append(sentence_vector / count)
        count_list.append(count)
    return np.array(sentence_vector_list)


# #v1 tfidf作为向量
weight, words = countIdf(corpus)
result, clusters = Kmeans_SC(weight)
output(result, outputDir, clusters, "tfidf_SC_")
print('finish')

# v2 word2vec
# buildw2v()         # 判断模型是否存在，训练
# weight, words = countIdf(corpus)
# sorted_words_list = sort_tfidf() # 每题词tfidf排序
# sentence_vector_list = getvec()  # 获得句矢量
# result, clusters = Kmeans_SSE(sentence_vector_list)
# output(result, outputDir, clusters, "w2v_SSE_")
# print('finish')
