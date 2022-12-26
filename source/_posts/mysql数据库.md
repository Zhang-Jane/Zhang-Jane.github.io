---
title: mysql数据库
tags: mysql
categories: mysql
abbrlink: 82bdb349
date: 2021-05-11 18:04:16
---

# 安装mysql

https://www.runoob.com/../images/mysql/mysql-install.html

# mysql的存储引擎

查看引擎语句

`show engines;` 查看所有的引擎

`SHOW VARIABLES LIKE 'default_storage_engine';` 查看当前默认引擎

```
存储引擎 -- 存储数据的方式
一张表
    数据
    表的结构
    索引(查询的时候使用的一个目录结构)

Innodb存储引擎    mysql5.6之后的默认的存储引擎
数据和索引存储在一起 2个文件
    数据索引\表结构
数据持久化
支持事务   : 为了保证数据的完整性,将多个操作变成原子性操作   : 保持数据安全
支持行级锁 : 修改的行少的时候使用                          : 修改数据频繁的操作
支持表级锁 : 批量修改多行的时候使用                        : 对于大量数据的同时修改
支持外键   : 约束两张表中的关联字段不能随意的添加\删除      : 能够降低数据增删改的出错率


Myisam存储引擎    mysql5.5之前的默认的存储引擎
数据和索引不存储在一起  3个文件
    数据\索引\表结构
数据持久化
只支持表锁

Memory存储引擎
数据存储在内存中, 1个文件
    表结构
数据断电消失

行级锁，表级锁和页级锁对比：

行级锁 行级锁是Mysql中锁定粒度最细的一种锁，表示只针对当前操作的行进行加锁。行级锁能大大减少数据库操作的冲突。其加锁粒度最小，但加锁的开销也最大。行级锁分为共享锁 和 排他锁。

特点：开销大，加锁慢；会出现死锁；锁定粒度最小，发生锁冲突的概率最低，并发度也最高。

表级锁 表级锁是MySQL中锁定粒度最大的一种锁，表示对当前操作的整张表加锁，它实现简单，资源消耗较少，被大部分MySQL引擎支持。最常使用的MYISAM与INNODB都支持表级锁定。表级锁定分为表共享读锁（共享锁）与表独占写锁（排他锁）。

特点：开销小，加锁快；不会出现死锁；锁定粒度大，发出锁冲突的概率最高，并发度最低。

页级锁 页级锁是MySQL中锁定粒度介于行级锁和表级锁中间的一种锁。表级锁速度快，但冲突多，行级冲突少，但速度慢。所以取了折衷的页级，一次锁定相邻的一组记录。

特点：开销和加锁时间界于表锁和行锁之间；会出现死锁；锁定粒度界于表锁和行锁之间，并发度一般
```



# 数据库的基本操作

## 用户相关操作

```
查看当前用户是谁? select user();
给当前用户设置密码 set password = password('123');
创建用户 create user '用户名'@'主机的ip/主机域名' identified by '密码'
授权 grant select on 数据库名.* to '用户名'@'主机的ip/主机域名' identified by '密码'
授权并创建用户 grant select on 数据库名.* to '用户名'@'主机的ip/主机域名'
```

## 数据库相关的操作

```
创建库  create database 数据库名;
切换到这个库下  use 库名
查看所有库 show databases;
```

## 表相关的操作

```
查看这个库下的所有表  show tables;
查看表的创建语句 show create table 表名;
创建表  create table 表名(字段名 数据类型(长度),字段名 数据类型(长度),..);
删除表  drop table 表名;
查看表结构  desc 表名;
增 : insert into 表 values (一行数据),(一行数据),(一行数据);
删 : delete from 表 where 条件;
改 : update 表 set 字段名=值,字段2=值2 where 条件;
查 : select 字段 from 表;
```

# 数据类型

## 数字类型

**这5种整型的占用空间是固定的，均与其后设置的 n 无关（它的含义是“**显示位宽**”，这个 n 无论填任何数，**不影响存储环节，仅影响在检索时的输出格式**，而且在非常严格的情况下才成立。），例如设置字段类型为 int ，则无论 n 设置什么，它占用的空间就是4个字节**。

这5种整型的占用空间分别是：

```text
tinyint ：1个字节，
smallint ：2个字节，
mediumint ：3个字节，
int ：4个字节，
bigint ：8个字节。
```

**注意：**当插入的值，超出取值范围的时候，MySQL并不会报错，而是自动变成成在取值范围内最接近该值的边界值。例如字段为 tinyint ，有符号型时取值范围 -128至127 ，当你输入-222时，不会报错，会自动存入最接近-222的-128，当你输入222时，会自动存入127。

创建表

```
create table t1 (
id int,
age int unsigned 默认有符号，无符号需要添加unsigned
);

```

## 浮点类型

**FLOAT** 类型固定占用4个字节， **DOUBLE** 类型固定占用8个字节。

它的定义方式是 DECIMAL(M,D) ，其中 M 表示最大位数，D 表示小数点右侧的位数。这里的“位”不是二进制的比特位，而是指十进制的数字的位数。

例如：

我们定义 DECIMAL(5,2) ，则表示最大位数为5位，小数点后2位，因此小数点前还剩下3位，于是取值范围为 -999.99至999.99。位数多了四舍五入。

**DECIMAL**：

对DECIMAL(M,D) ，如果M>D，为M+2否则为D+2



## 字符串类型

| 类型       | 大小                  | 用途                            |
| :--------- | :-------------------- | :------------------------------ |
| CHAR       | 0-255 bytes           | 定长字符串                      |
| VARCHAR    | 0-65535 bytes         | 变长字符串                      |
| TINYBLOB   | 0-255 bytes           | 不超过 255 个字符的二进制字符串 |
| TINYTEXT   | 0-255 bytes           | 短文本字符串                    |
| BLOB       | 0-65 535 bytes        | 二进制形式的长文本数据          |
| TEXT       | 0-65 535 bytes        | 长文本数据                      |
| MEDIUMBLOB | 0-16 777 215 bytes    | 二进制形式的中等长度文本数据    |
| MEDIUMTEXT | 0-16 777 215 bytes    | 中等长度文本数据                |
| LONGBLOB   | 0-4 294 967 295 bytes | 二进制形式的极大文本数据        |
| LONGTEXT   | 0-4 294 967 295 bytes | 极大文本数据                    |

CHAR(n) 和 VARCHAR(n) 两者中的 n 含义均为该字段最大可容纳的**字符**数

CHAR(4) 表示固定容纳4个字符，当少于4个字符时，会使用空格填充空缺的部分，使其达到4个字符。而VARCHAR(4) 类型对于未达到 n 字符的情况不会补空

关于计算 VARCHAR 类型字符串的占用空间，有一点需要说明的是， VARCHAR 类型字符串的占用空间实际上包含2部分，一是存储数据本身占用的空间，二是描述数据的元数据占用的空间，例如 VARCHAR 类型会使用1个字节记录存入数据实际的字符数。下述描述的“占用空间”特指前者，即存储数据本身占用的空间，不包含描述数据的元数据占用的空间。（其他数据类型等同）

## 日期和时间类型

表示时间值的日期和时间类型为DATETIME、DATE、TIMESTAMP、TIME和YEAR。

每个时间类型有一个有效值范围和一个"零"值，当指定不合法的MySQL不能表示的值时使用"零"值。

TIMESTAMP类型有专有的自动更新特性，将在后面描述。

| 类型      | 大小 ( bytes) | 范围                                                         | 格式                | 用途                     |
| :-------- | :------------ | :----------------------------------------------------------- | :------------------ | :----------------------- |
| DATE      | 3             | 1000-01-01/9999-12-31                                        | YYYY-MM-DD          | 日期值                   |
| TIME      | 3             | '-838:59:59'/'838:59:59'                                     | HH:MM:SS            | 时间值或持续时间         |
| YEAR      | 1             | 1901/2155                                                    | YYYY                | 年份值                   |
| DATETIME  | 8             | 1000-01-01 00:00:00/9999-12-31 23:59:59                      | YYYY-MM-DD HH:MM:SS | 混合日期和时间值         |
| TIMESTAMP | 4             | 1970-01-01 00:00:00/2038结束时间是第 **2147483647** 秒，北京时间 **2038-1-19 11:14:07**，格林尼治时间 2038年1月19日 凌晨 03:14:07 | YYYYMMDD HHMMSS     | 混合日期和时间值，时间戳 |

## ENUM和SET类型

ENUM：单选，在规定的范围内选择一个

SET：多选，在规定的范围内选择多个

# 约束

MYSQL中，常用的几种约束：

| 约束类型： | 主键        | 外键        | 唯一   | 非空     | 自增           | 默认值  |
| ---------- | ----------- | ----------- | ------ | -------- | -------------- | ------- |
| 关键字：   | primary key | foreign key | unique | not null | auto_increment | default |

## 主键

**第一个被定义为非空+唯一的列会自动成为主键。**

- 每个表只能定义一个主键。
- 主键值必须唯一标识表中的每一行，且不能为 NULL，即表中不可能存在两行数据有相同的主键值。这是唯一性原则。
- 一个列名只能在复合主键列表中出现一次。
- 复合主键不能包含不必要的多余列。当把复合主键的某一列删除后，如果剩下的列构成的主键仍然满足唯一性原则，那么这个复合主键是不正确的。这是最小化原则。

## 唯一

- 字段唯一不重复

- 联合唯一

## 自增

- 只对数字有效，自带非空约束

- 至少是unique的约束之后才能使用auto_increment

## 外键

外键删除：

CASCADE：父表delete、update的时候，子表会delete、update掉关联记录；
SET NULL：父表delete、update的时候，子表会将关联记录的外键字段所在列设为null，所以注意在设计子表时外键不能设为not null；
RESTRICT：如果想要删除父表的记录时，而在子表中有关联该父表的记录，则不允许删除父表中的记录；
NO ACTION：同 RESTRICT，也是首先先检查外键；

# 单表查询

## Having与Where的区别

- where 子句的作用是在对查询结果进行分组前，将不符合where条件的行去掉，即在分组之前过滤数据，where条件中不能包含聚组函数，使用where条件过滤出特定的行。
- having 子句的作用是筛选满足条件的组，即在分组之后过滤数据，条件中经常包含聚组函数，使用having 条件过滤出特定的组，也可以使用多个分组标准进行分组。

```
1.select语句
最简单的select
    select * from 表;
    select 字段,... from 表;
重命名字段
    select 字段 as 新名字,... from 表;
    select 字段 新名字,... from 表;
去重
    select distinct 字段 from 表;
    select distinct age,sex from employee;
使用函数
    concat
    concat_ws
四则运算的
     select emp_name,salary*12 from employee; 乘法
     select emp_name,salary*12 as annual_salary from employee;
使用判断逻辑
    case when语句 相当于 if条件判断句

where 筛选所有符合条件的行
    比较运算符
        > < >= <= <> !=
    范围
        between 10000 and 20000 要1w-2w之间的
        in (10000,20000)   只要10000或者20000的
    模糊匹配
        like
            % 通配符 表示任意长度的任意内容
            _ 通配符 一个字符长度的任意内容
        regexp
            '^a'
            'g$'
    逻辑运算
        not\and\or

查看岗位描述不为NULL的员工信息
    is
    select * from employee where post_comment is not null;
查看岗位是teacher且薪资不是10000或9000或30000的员工姓名、年龄、薪资
    select emp_name, age, salary
    from employee wherepost = 'teacher' and salary not in(10000,9000,30000)
查看岗位是teacher且名字是jin开头的员工姓名、年薪
     select emp_name,salary*12 from employee where post = 'teacher' and emp_name like 'jin%';

分组 group by 根据谁分组,可以求这个组的总人数,最大值,最小值,平均值,求和 但是这个求出来的值只是和分组字段对应
    并不和其他任何字段对应,这个时候查出来的所有其他字段都不生效.
聚合函数
    count 求个数
    max  求最大值
    min  求最小值
    sum  求和
    avg  求平均

    SELECT post,emp_name FROM employee GROUP BY post;
    SELECT post,GROUP_CONCAT(emp_name) FROM employee GROUP BY post;

having 过滤语句
    在having条件中可以使用聚合函数,在where中不行
    适合去筛选符合条件的某一组数据,而不是某一行数据
    先分组再过滤 : 求平均薪资大于xx的部门,求人数大于xx的性别,求大于xx人的年龄段
查询各岗位内包含的员工个数小于2的岗位名、岗位内包含员工名字、个数
group by post having count(id) < 2;

排序 order by
    默认是升序  asc
    降序  desc
    order by age ,salary desc
        优先根据age从小到大排,在age相同的情况下,再根据薪资从大到小排

limit m,n
    从m+1项开始,取n项
    如果不写m,m默认为0

    limit n offset m
```

# 连表查询

![mysql的多表连接](../images/mysql/mysql的多表连接.jpg)

# 索引

# 一、索引定义

> 索引（Index）是帮助Mysql高效获取数据等数据结构。

索引是排好序的快速查找数据结构，故影响sql执行中的查找和排序。

# 二、索引的优势和劣势

## 2.1 索引优势

> 索引大幅度提高了查询效率，降低了数据库的IO成本。降低了数据排序成本，降低了CPU的消耗。

## 2.2 索引劣势

> 因为索引是一个独立的表，里面存了主键与索引字段，并且指向实体表的记录，所以也是占空间的。并且虽然有了所以之后查询速度快，但是对相应数据更新（insert、update、delete）的速度变慢了，所以对于那些经常需要更新的数据表尽量不要加索引。

# 三、索引分类

## 3.1 单值索引

> 一个索引只包含单个列，一个表可以有多个单值索引

## 3.2 唯一索引

> 索引列的值必须唯一，单允许空值

## 3.3 复合索引

> 一个索引包含多个列

- 主键是一种特殊的唯一索引

## 3.4 全文索引

> 这是一种特殊类型的索引，它查找的是文本中的关键词，而不是直接比较索引中的值，全文索引更类似于搜索引擎做的事情，实际生产中我们一般不会使用MySQL来做类似搜索引擎的工作

## 3.5 聚簇索引

聚簇索引：将数据存储与索引放到了一块，找到索引也就找到了数据

> 聚集索引（Innodb）：
> 1、建表的时候，如果指定了主键，则主键就是聚簇索引。
> 2、建表的时候，如果没有指定主键，且含有唯一索引，则会选择一个唯一的非空索引作为聚簇索引。
> 3、如果即不含有主键，也不含有唯一索引，则隐式使用6个字节的rowId作为聚簇索引。

InnoDB聚集索引和普通索引有什么差异？

InnoDB**聚集索引**的叶子节点存储行记录，因此， InnoDB必须要有，且只有一个聚集索引：

（1）如果表定义了PK，则PK就是聚集索引；

（2）如果表没有定义PK，则第一个not NULL unique列是聚集索引；

（3）否则，InnoDB会创建一个隐藏的row-id作为聚集索引；

 InnoDB**普通索引**的叶子节点存储主键值。

聚簇索引查找过程

> 如果查询条件为普通索引（非聚簇索引），需要扫描两次B+树，第一次扫描通过普通索引定位到聚簇索引的值，然后第二次扫描通过聚簇索引的值定位到要查找的行记录数据。 如：select * from user where age = 30;

```text
1. 先通过普通索引 age=30 定位到主键值 id=1
2. 再通过聚集索引 id=1 定位到行记录数据
```

## 回表查询

> 先通过普通索引的值定位聚簇索引值，再通过聚簇索引的值定位行记录数据，需要扫描两次索引B+树，它的性能较扫一遍索引树更低。

## 索引覆盖

> 只需要在一棵索引树上就能获取SQL所需的所有列数据，无需回表，速度更快。
> 例如：select id,age from user where age = 10;
>
## 如何实现覆盖索引
>
> > 常见的方法是：将被查询的字段，建立到联合索引里去。
> > 1、如实现：select id,age from user where age = 10;
> > explain分析：因为age是普通索引，使用到了age索引，通过一次扫描B+树即可查询到相应的结果，这样就实现了覆盖索引

# 四、索引的基本操作

- 查看索引

> show index from tblname;

- 直接创建索引

> CREATE INDEX index_name ON table(column(length))

- 修改表结构的方式添加索引

> ALTER TABLE table_name ADD INDEX index_name ON (column(length))

- 创建表的时候同时创建索引



```objectivec
    CREATE TABLE `table` (

    `id` int(11) NOT NULL AUTO_INCREMENT ,

    `title` char(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL ,

    `content` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL ,

    `time` int(10) NULL DEFAULT NULL ,

    PRIMARY KEY (`id`),

    INDEX index_name (title(length))

    )
```

- 删除索引

> DROP INDEX index_name ON table

# 五、创建索引建议

## 5.1 适合建索引

a、主键自动建立唯一索引
 b、频繁作为查询条件的字段时候建立索引
 c、查询中与其它表关联的字段，外键关系建立索引
 d、where 里用不到的不建立索引
 e、查询中排序的字段，建立索引将大大提高排序速度
 f、查询中统计或分组的字段

## 5.2 不适合建索引

a、表记录太少
 b、经常增删改的表，建立索引将使得更新变慢
 c、数据重复，且分布平均的字段

# 六、Mysql索引结构

MySql索引使用的数据结构是B+树

- 不使用Hash存储的原因是

> a、使用hash存储必须使用好的hash算法。
> b、hash存储由于数据分布的不均衡，比较占用内存。
> c、hash存储不能进行范围查询，范围查询多于等值查询。（关键点）

- 不使用二叉树、BST、AVL、红黑树的原因：

> 当插入的节点越来越多，会导致树的深度越来越深，导致查询变慢。

# 七、关于索引的常见问题

- B+树有多少层

> 3～4层足够

- 索引用int 还是varchar

> 索引字段存储空间越小越好

- 索引为什么要自增

> 会引起底层的数据分裂或合并，影响性能



# 数据库使用的时候有什么注意事项
```
从搭建数据库的角度上来描述问题

建表的角度上

1.合理安排表关系
2.尽量把固定长度的字段放在前面
3.尽量使用char代替varchar
4.分表: 水平分,垂直分

使用sql语句的时候

1.尽量用where来约束数据范围到一个比较小的程度,说分页的时候
2.尽量使用连表查询而不是子查询
3.删除数据或者修改数据的时候尽量要用主键作为条件
4.合理的创建和使用索引
    # 1.查询的条件字段不是索引字段
        # 对哪一个字段创建了索引,就用这个字段做条件查询
    # 2.在创建索引的时候应该对区分度比较大的列进行创建
        # 1/10以下的重复率比较适合创建索引
    # 3.范围
        # 范围越大越慢
        # 范围越小越快
        # like 'a%'  快
        # like '%a'  慢
    # 4.条件列参与计算/使用函数
    # 5.and和or
        # id name
        # select * from s1 where id = 1800000 and name = 'eva';
        # select count(*) from s1 where id = 1800000 or name = 'eva';
        # 多个条件的组合,如果使用and连接
            # 其中一列含有索引,都可以加快查找速度
        # 如果使用or连接
            # 必须所有的列都含有索引,才能加快查找速度
    # 6.联合索引 : 最左前缀原则(必须带着最左边的列做条件,从出现范围开始整条索引失效)
        # (id,name,email)
        # select * from s1 where id = 1800000 and name = 'eva' and email = 'eva1800000@oldboy';
        # select * from s1 where id = 1800000 and name = 'eva';
        # select * from s1 where id = 1800000 and email = 'eva1800000@oldboy';
        # select * from s1 where id = 1800000;
        # select * from s1 where name = 'eva' and email = 'eva1800000@oldboy';
        # (email,id,name)
        # select * from s1 where id >10000 and email = 'eva1800000@oldboy';
    # 7.条件中写出来的数据类型必须和定义的数据类型一致
        # select * from biao where name = 666   # 不一致
    # 8.select的字段应该包含order by的字段
        # select name,age from 表 order by age;  # 比较好
        # select name from 表 order by age;  # 比较差
```
## 最左前缀原则

什么是最左前缀原则？什么是最左匹配原则
顾名思义，就是最左优先，在创建多列索引时，要根据业务需求，where子句中使用最频繁的一列放在最左边。
最左前缀匹配原则，非常重要的原则，mysql会一直向右匹配直到遇到范围查询(>、<、between、like)就停止匹配，比如a = 1 and b = 2 and c > 3 and d = 4 如果建立(a,b,c,d)顺序的索引，d是用不到索引的，如果建立(a,b,d,c)的索引则都可以用到，a,b,d的顺序可以任意调整。
=和in可以乱序，比如a = 1 and b = 2 and c = 3 建立(a,b,c)索引可以任意顺序，mysql的查询优化器会帮你优化成索引可以识别的形式

# 事物

1. **原子性：** 事务是最小的执行单位，不允许分割。事务的原子性确保动作要么全部完成，要么完全不起作用；
2. **一致性：** 执行事务前后，数据保持一致，多个事务对同一个数据读取的结果是相同的；
3. **隔离性：** 并发访问数据库时，一个用户的事务不被其他事务所干扰，各并发事务之间数据库是独立的；
4. **持久性：** 一个事务被提交之后。它对数据库中数据的改变是持久的，即使数据库发生故障也不应该对其有任何影响。

