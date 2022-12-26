---
title: mongoDB
abbrlink: 41106fe2
date: 2022-12-25 17:19:24
tags:
---
# mongo数据库的简介

mongoDB是一个基于分布式文件存储的数据库。它是非关系型数据库

# mongo的特点

它的特点是高性能、易部署、易使用，存储数据非常方便。主要功能特性有：
1.面向集合存储，易存储对象类型的数据。
2.模式自由。
3.支持动态查询。
4.支持完全索引，包含内部对象。
5.支持查询。
6.支持复制和故障恢复。
7.使用高效的二进制数据存储，包括大型对象（如视频等）。
8.自动处理碎片，以支持云计算层次的扩展性
9.支持RUBY，PYTHON，JAVA，C++，PHP等多种语言。
10.文件存储格式为BSON（一种JSON的扩展）

# mongo的数据逻辑结构

- | SQL                | MongoDB            |
  | ------------------ | ------------------ |
  | 表（Table）        | 集合（Collection） |
  | 行（Row）          | 文档（Document）   |
  | 列（Col）          | 字段（Field）      |
  | 主键（PrimaryKey） | 对象（ObjectId）   |

- 文档 -> 关系库中的一行数据

- 多个文档组成一个集合 -> 关系数据库的表

- 多个集合构成数据库 包含 -> 集合 -> 包含 -> 文档

# mongo数据存储结构

mongo默认的数据目录是/data/db，它负责存储所有的数据文件。mongo内部有预分配空间的机制，以至于mongo始终保持额外的的空间，从而避免了由于数据暴增带来的磁盘压力过大，每个数据文件最大2G。
1.命名空间文件：命名空间(.ns结尾文件) 它存储了分配和正在使用的磁盘空间
2.数据库文件：以(0,1,2,3...)结尾的，并且后面的文件大小是前面一个文件大小的2倍！

为什么MongodDB物理存储使用这种方式设计呢？好处是什么？：当一方面如果数据库很小的时候，不至于数据库小而浪费存储空间，另外一方面如果数据库增长比较快，通过预分配的方式，是上一个文件的两倍的办法，来避免数据的剧增造成分配文件造成的性能下降，来预分配空间，以空间的办法来换取性能的提升。

# 什么是BSON

BSON是一种类似json的二进制形式的存储格式，简称Binary JSON，它和JSON一样，支持内嵌的文档对象和数组对象，但是BSON有JSON没有的一些数据类型，如Date和BinData类型。

BSON可以做为网络数据交换的一种存储形式，这个有点类似于Google的Protocol Buffer，但是BSON是一种schema-less的存储形式，它的优点是灵活性高，但它的缺点是空间利用率不是很理想。

BSON有三个特点：轻量性、可遍历性、高效性。

# mongo的分片

分片是将数据水平切分到不同的物理节点。当应用数据越来越大的时候，数据量也会越来越大。当数据量增长时，单台机器有可能无法存储数据或可接受的读取写入吞吐量。利用分片技术可以添加更多的机器来应对数据量增加
以及读写操作的要求。

# mongo的索引

索引用于高效的执行查询,没有索引的MongoDB将扫描整个集合中的所有文档,这种扫描效率很低,需要处理大量的数据.索引是一种特殊的数据结构,将一小块数据集合保存为容易遍历的形式.索引能够存储某种特殊字段或字段集的
值,并按照索引指定的方式将字段值进行排序

# ObjectID

它由十六进制构成
前4个字节表示时间戳
接下来的3个字节是机器标识码
紧接的两个字节由进程id组成（PID）
最后三个字节是自增计数器

# mongo操作

- mongo的or和and
- 查询子文档或者数组中的数据的时候，可以用访问.访问，这个.不仅可以访问子文档，还可以访问数组中的索引
- 聚合查询，它可以把数据按照一定的规则进行筛选和处理
  - 聚合的命名，aggregate，格式`aggregate(1-N个阶段)`。
- 管道操作符
  - $project 修改输入文档的结构，可以重命名，增加，删除域。
  - $match 用与过滤数据只输出符合条件的文档，它和find功能完全一样，虽然如此，但是，match可以组合其他操作
  - $limit 用来限制mongodb聚合管道返回的文档数
  - $skip 跳过制定数量的文档
  - $unwind 将文档中的某一个数组类型字段拆分多条，每条包含数组中的一个值。
  - $group 将集合中文档分组，可用于统计结果
  - $sort 排序
  - $lookup 用于同一数据库中其他集合之间进行join操作
- 聚合表达式
  - $sum 
  - $avg
  - $min
  - $max
  - $push
  - $first
  - $last
- 字段含有特殊字符用$literal表示

# mongo常用的操作

## python操作mongo对应的方法

| MongoDB        | PyMongo           |
| -------------- | ----------------- |
| insertOne      | insert_one        |
| insertMany     | insert_many       |
| find           | find              |
| updateMany     | update_many       |
| updateOne      | update_one        |
| deleteOne      | delete_one        |
| deleteMany     | delete_many       |
| null           | None              |
| true           | True              |
| false          | False             |
| sort({_id:-1}) | sort([(_id, -1)]) |



## 根据mongo的_id获取入库的时间

```python
import time
from pymongo import MongoClient
from bson import ObjectId

test_db = MongoClient().test1
test_db_client = test_db.test2
c_list = test_db_client.find({}, batch_size=1).limit(1)
for c in c_list:
    id = c["_id"]
    print(id.generation_time.timetuple())
    ts = time.strftime("%Y-%m-%d %H:%M:%S", id.generation_time.timetuple())
    print(ts)

```



