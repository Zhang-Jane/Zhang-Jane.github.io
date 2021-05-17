---
title: mongo日常命令笔记
tags: mongodb
categories: mongodb
abbrlink: 3898c7fc
date: 2021-05-11 17:43:34
---

# mongo命令

## group and distinct

```
demo data:
db.getCollection('test111').insert([
{"orderID" : "30688", "region" : "CO", "customerID" : "11396783", "productID" : "13001"},
{"orderID" : "30688", "region" : "CO", "customerID" : "11396783", "productID" : "8002"},
{"orderID" : "30688", "region" : "CO", "customerID" : "11396783", "productID" : "5001"},
{"orderID" : "89765", "region" : "CA", "customerID" : "54157526", "productID" : "7412"},
{"orderID" : "89765", "region" : "CA", "customerID" : "54157526", "productID" : "5198"},
{"orderID" : "21546", "region" : "KA", "customerID" : "20103585", "productID" : "6851"},
{"orderID" : "21546", "region" : "KA", "customerID" : "20103585", "productID" : "7412"},
{"orderID" : "21546", "region" : "KA", "customerID" : "20103585", "productID" : "6987"},
{"orderID" : "21794", "region" : "NY", "customerID" : "78125522", "productID" : "13001"},
])
example:
SQL Query: (group by & count of distinct)

select city,count(distinct(emailId)) from TransactionDetails group by city;
Equivalent mongo query would look like this:

db.TransactionDetails.aggregate([ 
{$group:{_id:{"CITY" : "$cityName"},uniqueCount: {$addToSet: "$emailId"}}},
{$project:{"CITY":1,uniqueCustomerCount:{$size:"$uniqueCount"}} } 
]);
exercise:
db.getCollection('tal_7-7_step4').aggregate([
   {"$group": {_id: {"region":"$region"}, "uniqueCount": {"$addToSet": "$orderID"}}},
   {"$project":{"region":1,"unique_count":{$size:"$uniqueCount"}}}
]);

db.getCollection('xx').aggregate([
  {
    "$match": {
      "ts_short": {
        "$gte": "2021-02-22",
        "$lte": "2021-02-24"
      }
    }
  },
  {
    "$match": {
      "data": {
        "$exists": true
      }
    }
  },
  {
    "$group": {
      "_id": {
        "city_name": "$city_name"
      },
      "uniqueCount": {
        "$addToSet": "$cla_id"
      }
    }
  },
  {
    "$project": {
      "city_name": 1,
      "unique_count": {
        "$size": "$uniqueCount"
      }
    }
  }
])

```



## 连接远程mongo

```
 mongo xxxx/admin -u xx -p
 
 use DATABASE_NAME # 如果数据库不存在，则创建数据库，否则切换到指定数据库。
 db   ---显示当前使用的数据库名称
 show dbs
```

## explain

```sql
db.pk_rank_all.explain().distinct("_sub_room_id", {'status': 0, '_ts_string':  {'$gte': '2021-02-22'}, '_live_id': '5882382814106629'})
```

## 查询数据不为空

```
db.getCollection('xx').find({"data.0":{$exists: true}})
```

## 查询不为空

```bash
db.getCollection('xx').find({"result.cateList":{"$ne":null}}, {"result.cateList": 1, "title": 1 })

db.getCollection('xx').find({"result.cateList":null})

db.getCollection('xxx').find({"data":{$exists: true}}).sort({_id:-1})
```

## 查询列表存在

```
db.getCollection('xxx').find({"data.list.0":{'$exists': true}})
```



## 查询字段为空

```
db.getCollection('xx').find({"cityName":{$exists: true}, "ts_string": "2020-12-10"})
db.getCollection('xx').find({"cityName":{"$eq":null}, "ts_string": "2020-12-10"})
db.getCollection('xx').find({"ts_string": "2021-04-09","cityName":{"$ne":null, "$exists": true}})

```

## 更新

```
db.getCollection('xx').update({"read_status":1},{$set:{"read_status":0}},{multi:true})

db.getCollection('xx').update({$and:[{"read_status":1},{"record_time":/2018-12/}]},{$set:{"read_status":0}},{multi:true})
 
```

## 查询制定字段

```
db.getCollection('xx').find({"data.cla_id": "43568ad24efa41d48d2a2a62abe39598"},{"ts_short":1, "_id":0, "data.cla_quota_num":1, "data.max_persons":1, "data.can_apply_persons":1})

db.getCollection('xx').find({"data.cla_id": "43568ad24efa41d48d2a2a62abe39598"}, {"data": {$elemMatch:{"cla_id":"43568ad24efa41d48d2a2a62abe39598"}}}, {"data.cla_id":1, "ts_short":1, "_id":0, "data.cla_quota_num":1, "data.max_persons":1, "data.can_apply_persons":1}).sort({_id:-1})

db.getCollection('xx').aggregate([ 
{'$unwind': "$data"},
{"$match": {"data.cla_id":"43568ad24efa41d48d2a2a62abe39598"}}, 
{"$project":{"data.cla_id":1, "ts_short":1, "_id":0, "data.cla_quota_num":1, "data.max_persons":1, "data.can_apply_persons":1}},
{'$sort': {'_id': -1}},
])

db.getCollection('xx').aggregate([ 
{'$unwind': "$data"},
{"$match": {"data.cla_id":"43568ad24efa41d48d2a2a62abe39598"}}, 
{"$project":{"data.cla_id":1, "ts_short":1, "_id":0, "data.cla_quota_num":1, "data.max_persons":1, "data.can_apply_persons":1}},
{'$sort': {'_id': -1}},
]).cursor(10)



```



## 按照时间范围查询

```shell
db.getCollection("xx").find({"ts_short":{"$gte":"2020-10-09","$lte":"2020-10-09"}}).count();


db.getCollection('xx').find({"series_id":431, "_ts_string":"2020-11-28", "_batch":{"$gte":"2020-10-09","$lte":"2020-10-09"}}).count()


```

## 查询具体某一天的数据

```shell
db.getCollection("xx").find({"ts_short":"2020-11-09"}).count();
```

## 去重查询

```bash
db.getCollection('xxx').distinct("data.classList.code")

db.getCollection('xxx').distinct("data.classList.code", {"ts_short":"2020-11-21"})

db.getCollection('xxx').distinct("data.classList.code", {"ts_short":"2020-11-25", "city_name":"北京"})


db.getCollection('xx').distinct('data.classList.code',{'data.classList.classCapacityName':{'$in':['1人','1对1']},'ts_short':{'$gte':'2020-11-24','$lte':'2020-11-25'}})


db.getCollection('xx').distinct("box_no", {"series_id":431, "_ts_string":"2020-11-28", "_batch":{"$gte":"2020-11-28 08:00:00","$lte":"2020-11-28 10:00:00"}})


db.getCollection('xxx').distinct("set_no", {"_ts_string":"2020-12-08", "goods_id":576})
396

```



## 聚合(aggregate)

参考：https://docs.mongodb.com/manual/reference/operator/aggregation

| SQL 操作/函数 | mongodb聚合操作 |
| ------------- | --------------- |
| where         | $match          |
| group by      | $group          |
| having        | $match          |
| select        | $project        |
| order by      | $sort           |
| limit         | $limit          |
| sum()         | $sum            |
| count()       | $sum            |

## 过滤筛选

```
db.xx.aggregate([{"$match":{"count":{"$gt":800}}}])


db.getCollection('xx').aggregate([{'$project':{"nane":"data.classInfo.name", "code":"data.classInfo.code"}}])
```

## 分组统计

```bash
db.getCollection('xx').aggregate([{"$group": {"_id":"$city_name", count: { $sum: 1 }}}])

db.getCollection('xx').aggregate([{"$match":{"ts_short":"2020-11-25"}}, {"$group":{"_id":"$city_name", "code":"$data.classList.code",count: { $sum: 1 }}}])

db.getCollection('xx').aggregate([{"$match":{"ts_short":"2020-11-25"}}, {"$group":{"_id":{"city_name":"$city_name","code":"$data.classList.code"}}}])

db.getCollection('xx').aggregate([{"$match":{"ts_short":{'$gte':'2020-12-20','$lte':'2020-12-28'}}},{"$group":{"_id":"$ts_short", count: { $sum: 1 }}}])

db.getCollection('xx').aggregate([{"$match":{"ts_short":{'$gte':'2020-12-01','$lte':'2020-12-28'}}},{"$group":{"_id":"$ts_short", count: { $sum: 1 }}}, {"$sort":{_id:-1}}])

db.getCollection('xx').aggregate([{'$match': {'batch_id': {'$gte': '2020-12-01', '$lte': '2020-12-28'}}}, {'$group': {'_id': {'date': '$batch_id'}, count: {'$sum': 1}}}, {'$sort': {'_id': -1}}])
```

### 联表查询

**特别注意：**

1. 只能两个表联合查询

2. 不能跨库联合

3. from的集合不能分片

   在[$lookup](https://www.docs4dev.com/docs/zh/mongodb/v3.6/reference/reference-operator-aggregation-lookup.html#pipe._S_lookup)阶段，`from`集合不能为[sharded](https://www.docs4dev.com/docs/zh/mongodb/v3.6/reference/sharding.html)。但是，可以对运行[aggregate()](https://www.docs4dev.com/docs/zh/mongodb/v3.6/reference/reference-method-db.collection.aggregate.html#db.collection.aggregate)方法的集合进行分片。也就是说，在下面：

   ```
   db.collection.aggregate([
      { $lookup: { from: "fromCollection", ... } }
   ])
   ```

   - `collection`可以被分片。
   - `fromCollection`无法分片。

   这样，要将分片集合与未分片集合连接在一起，可以在分片集合上运行聚合并查找未分片集合；例如。：

   ```
   db.shardedCollection.aggregate([
      { $lookup: { from: "unshardedCollection", ... } }
   ])
   ```

   或者，或者要加入多个分片集合，请考虑：

   - 修改 Client 端应用程序以执行手动查找，而不是使用[$lookup](https://www.docs4dev.com/docs/zh/mongodb/v3.6/reference/reference-operator-aggregation-lookup.html#pipe._S_lookup)聚合阶段。
   - 如果可能，请使用[嵌入式数据模型](https://www.docs4dev.com/docs/zh/mongodb/v3.6/reference/core-data-model-design.html#data-modeling-embedding)消除加入集合的需要

**$lookup 语法如下:**

```
{
   $lookup:
     {
       from: <collection to join>,   #右集合
       localField: <field from the input documents>,  #左集合 join字段
       foreignField: <field from the documents of the "from" collection>, #右集合 join字段
       as: <output array field>   #新生成字段（类型array）
     }
}
```

| Field          | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `from`         | 右集合，指定在同一数据库中执行连接的集合。此集合不能shared分片。 |
| `localField`   | 指定左集合（db.collectionname）匹配的字段。如果左集合不包含localField，$lookup 视为null值来匹配。 |
| `foreignField` | 指定from集合（右集合）用来匹配的字段。如果集合不包含该字段，$lookup 视为null值来匹配。 |
| `as`           | 指定要添加到输入文档的新数组字段的名称。新的数组字段包含from集合中匹配的文档。如果在文档中指定的名称已经存在，现有的领域覆盖。 |

```sql
db.getCollection("A表").aggregate([
{
$lookup:{
from:"B表",
localField:"A_id", # 主集合的字段
foreignField:"B_id", # 被查集合的字段
as:"B_list" # 保存查询结果的字段名
}
},
])



db.getCollection("luckin_existed_shops").aggregate([
{
'$match':{
'ts_string': {'$gte': '2020-12-28', '$lte': '2020-12-28'}
}},
{
"$lookup":{
"from":"luckin_all_shops_detail",
"localField":"shopId",
"foreignField":"deptId", 
"as":"luck_shops" 
},
}
])

```

## 过滤统计

```shell
db.web.aggregate([
    {
        //解析list
        $unwind: "$tasks"
    },
//     {
//         //去掉无效数据 进行数据过滤
//         $match: {
//             "$and": [{
//                 "tasks.status": {
//                     $ne: []
//                 }
//             }, {
//                 "tasks.status": {
//                     $ne: 0
//                 }
//             }]
//         }
//     },
    {
        //重构表格
        $project: {
            _id: 0,
            type: "$tasks.status", 
            // 将tasks.status 转换成 别名 type 类似SQL中的AS别名
            result: {              
            // 将tasks.counts 转换成 别名 result
                $cond: {
                    //判断配型 数组取长度 数字取值
                    if : {
                        $eq: [{
                            "$type": "$tasks.counts"
                        }, "array"]
                    },
                    then: {
                        "$size": "$tasks.counts"
                    },
                    else : "$tasks.counts"
                }
            }
        }
    },
    {
        //按照type统计求合
        $group: {
            _id: "$type",
            count: {
                $sum: "$result" //对应上方重构后的数据别名,进行统计
            }
        }
    }
]
```

## 拆分数据查询

```
db.getCollection('xx').aggregate([
{"$match": 
    {"ts_short": 
        {'$gte': '2021-01-11', '$lte': '2021-01-13'}
        }
        },
{
//解析list
'$unwind': "$data",
},
{'$group': 
{
    '_id': 0,
    'count': {'$sum': 1},
}},
])
```

## mongo创建索引

https://www.runoob.com/mongodb/mongodb-indexing.html

```shell
db.xxx.ensureIndex({_crawler_batch_id:1},{background:true});
{
    "ts" : 1.0
}
```

## mongo的分片

在Mongodb里面存在另一种集群，就是分片技术,可以满足MongoDB数据量大量增长的需求。

当MongoDB存储海量的数据时，一台机器可能不足以存储数据，也可能不足以提供可接受的读写吞吐量。这时，我们就可以通过在多台机器上分割数据，使得数据库系统能存储和处理更多的数据。

### 查看当前的数据所占

### 查看当前的collection的分片情况

```bash
db.<collection>.stats()
```

/data/code/Ctrip/ctrip

### 分片的操作

mongodb单表数据量 > 500w 必须分片。**最好在表为空的时候进行，否则有可能很慢 。**

```bash
use xx
# 2.打开该数据库分片功能
sh.enableSharding("xx") 
# 3.片键需要指定一个索引，所以需要创建hashed_id索引。这行意思是以_id字段，在背景创建一个名叫_id_hashed的哈希值的索引。这一步根据该表数据量而定，有可能需要数小时
db.getCollection("xx").createIndex( { _id: "hashed" }, { name: "_id_hashed", background: true })
# 4.指定该索引为片键
sh.shardCollection( "xx.xx", {_id: "hashed"})
# 5.以上命令运行成功后，可以用这个命令来check现在分片的状态，这个命令查看的是所有的分片状态
sh.status() 
```