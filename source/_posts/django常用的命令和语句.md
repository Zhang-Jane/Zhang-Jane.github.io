---
title: django常用的命令和语句
abbrlink: b5b80a84
date: 2021-05-11 16:27:17
tags: django
categories: django
---

## 常见的命令

- python manage.py showmigrations，这个命令是显示出Django项目中的所有migrations文件及其状态

  [x]　代表已经执行完毕的migrations文件，　[]表示未执行或执行失败的文件。

- django-admin startproject mysite 创建Django项目

- python manage.py runserver 启动服务

- python manage.py startapp 创建应用

- python manage.py createsuperuser 创建后台管理超级用户

- python manage.py makemigrations <app>  生出迁移文件

- python manage.py migrate 执行迁移文件产生表

- python manage.py shell

- python manage.py inspectdb > models.py

- python3 manage.py sqlmigrate <app> <迁移文件前面的序号（0001）>   如何查看迁移文件对应的sql语句

- python
  def showsql():
      """
    	查看原生的sql
    	"""
      from django.db import connection
      queries = connection.queries
      print(queries[-1]['sql'])
  

## 单表

### 查询一个


xxx.objects.get(mid=147)


### 获得第一个


xxx.objects.first()


### 获得最后一个


xxx.objects.last()


### 获取总数


xxx.objects.count()


### 获得所有


xxx.objects.all()


注意：LIMIT 21不是直接查询所有

指出切片 （不支持负数索引）xxx.objects.all()[20:40]

### 过滤


xxx.objects.filter(name='jane')


### 模糊查询


查询j结尾的
xx.objects.filter(name__endswith='j')
查询j开头的
xx.objects.filter(name__startswith='j')
查询包含j的
xx.objects.filter(name__contains='j')
完全相等
xx.objects.filter(name__exact='j')


### 查询某个字段是否为null

xx.objects.filter(name__isnull=True)__

### 忽略大小写


mnane__i*** 忽略大小写


### 多条件查询


xxx.objects.filter(name__contains='j',mid=147)xxx.objects.filter(name__contains='j').filter(mid=147)


### 排除一部分


xxx.objects.filter(name__contains='j').exclude(mname__startswith='j')


### 排序


xxx.objects.order_by('mid')xxx.objects.order_by('-mid')


### 查询大于


xxx.objects.filter(created__gt='2017-10-20')


### 范围


sql的betwnxxx.objects.filter(created__range=('2017-10-20','2017-11-20'))


### 增加


xxx = xxx(title='',created='2017-2-28')xx.save()xxx.objects.create(title='',created='2018-11-11')


### 删除


xxx.delete()xxx.objects.filter(title__contains='博客').delete()


### 更新

- 方法1 （更新的是所有的字段） (没有id主键，就添加，有主键就更新)

  
  post = Post.objects.first()post.title='更新了'post.save() 	UPDATE `post_post` SET `title` = '更新了', `created` = '2017-11-27' WHERE `post_post`.`id` = 26
  

- 方法2（只更新修改的字段），推荐使用

  
  Post.objects.filter(id=26).update(title='又更新了')UPDATE `post_post` SET `title` = '又更新了' WHERE `post_post`.`id` = 26DataDisplay.objects.update_or_create
  

## 多表

### 一对一

[OneToOneField](https://docs.djangoproject.com/en/3.2/ref/models/fields/#onetoonefield)

### 一对多

[ForeignKey](https://docs.djangoproject.com/en/3.2/ref/models/fields/#foreignkey)

### 多对多

[ManyToManyField](https://docs.djangoproject.com/en/3.2/ref/models/fields/#manytomanyfield)

## 字段类型

https://docs.djangoproject.com/en/3.2/ref/models/fields/

## 聚合函数

- COUNT,MAX,MIN,AVG,SUM
  - xxx.objects.aggregate()

## 分组聚合
```python
ChatMessage.objects.values("talker_id").annotate(count=Count("*")).filter(count__gt=1)Post.objects.values('created').annotate(count=Count('*'))Post.objects.values('category__name').annotate(count=Count('*'))
```

## 原生查询

- 任何管理器对象都都有一个raw

  
Raw query must include the primary keyPost.objects.raw('select * from post_post')
  

- connection （当前数据库的连接对象）
```python 
from django.db import connection	
cursor = connection.cursor()	
datas = cursor.execute('SELECT count(*) ,post_category.name from post_post,post_category WHERE post_post.category_id==post_category.id GROUP BY post_post.category_id')	
cursor.close()	  
for data in datas:  	
  print(data)
  
```

- conection.queries 保存了这个执行的所有的sql语句

### Q查询

- orm的filer(id=5).filter(created='2017-12-15') and
- Q查询支持and，or,~(与或非)

```python
from django.db.models import Q
Post.objects.filter(Q(id=5) | Q(created='2017-12-15')) or Post.objects.filter(Q(id=5) & Q(created='2017-12-15')) and Post.objects.filter(~Q(id=5))
```

### F查询

- 给所有帖子的创建时间，都+1天

```python
from django.db.models import F 
import datetime
Post.objects.all().update(created=F('created')+datetime.timedelta(days=1))
```

- 查询是热门的记录（100个人看了商品60个买了，100看了帖子50个评论了）
- 查询热门帖子 100看了帖子50个评论了,而且阅读的数量必须大于30

```python
Post.objects.filter(read_count__lte=F('remark_count')*2).filter(read_count__gt=30)Post.objects.filter(Q(read_count__lte=F('remark_count')*2)&Q(read_count__gt=30))
```

## QuerySet（查询集）

- django.db.models.query QuerySet
- 惰性查询 （延迟查询）
- 查询的数据有限
- 缓存查询