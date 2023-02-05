---
title: redis日常命令笔记
tags: redis
categories: redis
abbrlink: f3bc1db9
date: 2021-05-11 17:47:15
---

## redis命令

## 命令使用推荐

参阅：https://developer.aliyun.com/article/531067#cc1

### 1.【推荐】 O(N)命令关注N的数量

例如hgetall、lrange、smembers、zrange、sinter等并非不能使用，但是需要明确N的值。有遍历的需求可以使用hscan、sscan、zscan代替。

### 2.【推荐】：禁用命令

禁止线上使用keys、flushall、flushdb等，通过redis的rename机制禁掉命令，或者使用scan的方式渐进式处理。

### 3.【推荐】合理使用select

redis的多数据库较弱，使用数字进行区分，很多客户端支持较差，同时多业务用多数据库实际还是单线程处理，会有干扰。

#### 4.【推荐】使用批量操作提高效率

```
原生命令：例如mget、mset。
非原生命令：可以使用pipeline提高效率。
```

### 5.【建议】Redis事务功能较弱，不建议过多使用

Redis的事务功能较弱(不支持回滚)，而且集群版本(自研和官方)要求一次事务操作的key必须在一个slot上(可以使用hashtag功能解决)

### 6.【建议】控制key的生命周期，redis不是垃圾桶。

建议使用expire设置过期时间(条件允许可以打散过期时间，防止集中过期)，不过期的数据重点关注idletime

### 7.【建议】高并发下建议客户端添加熔断功能(例如netflix hystrix)

熔断：
在分布式系统中，我们往往需要依赖下游服务，不管是内部系统还是第三方服务，如果下游出现问题，我们不在盲目地去请求，在一个周期内失败达到一定次数，不在请求，及时失败。过一段时间，在逐步放开请求，这样既能防止不断的调用，使下游服务更坏，保护了下游方，还能降低自己的执行成本，快速的响应，减少延迟，增加吞吐量。比如：Hystrix

### 8.【建议】根据自身业务类型，选好maxmemory-policy(最大内存淘汰策略)，设置好过期时间。

### 9.【强制】删除bigkey,不要直接删除，要循序渐进删除

**什么是bigkey**

在Redis中，一个字符串最大512MB，一个二级数据结构（例如hash、list、set、zset）可以存储大约40亿个(2^32-1)个元素，但实际上中如果下面两种情况，我就会认为它是bigkey。

1. 字符串类型：它的big体现在单个value值很大，一般认为超过10KB就是bigkey。
2. 非字符串类型：哈希、列表、集合、有序集合，它们的big体现在元素个数太多。

### 10.【强制】：拒绝bigkey(防止网卡流量、慢查询)

string类型控制在10KB以内，hash、list、set、zset元素个数不要超过5000。

默认策略是volatile-lru，即超过最大内存后，在过期键中使用lru算法进行key的剔除，保证不过期数据不被删除，但是可能会出现OOM问题。

### *rename-command

为了防止把问题带到生产环境，我们可以通过配置文件重命名一些危险命令，

例如keys等一些高危命令。操作非常简单，

只需要在conf配置文件增加如下所示配置即可：

> rename-command flushdb flushddbb

> rename-command flushall flushallall

> rename-command keys keysys

### 基本命令（基于本地redis无密码认证环境）
- INFO 查看redis的信息

  - redis-cli info CPU，redis-cli info Server，info Memory
  - redis-cli 终端中使用info <section>用户获取指定的信息
- 查看当前所有的KEYS

  - keys 匹配有3个通配符 *, ? ,[]

    - *: 通配任意多个字符

    - ?: 通配单个字符

    - []: 通配括号内的某1个字符

  - **注意**

    - keys 算法是遍历算法，复杂度是 O(n)，如果实例中有千万级以上的 key，这个指令就会导致 Redis 服务卡顿

    - `KEYS`命令的性能随着数据库数据的增多而越来越慢
    - `KEYS`命令会引起阻塞，连续的 `KEYS`命令足以让 Redis 阻塞
- SCAN

  - Redis从2.8版本开始支持scan命令，SCAN命令的基本用法如下：
    - 复杂度虽然也是 O(n)，通过游标分步进行不会阻塞线程;
    - 有限制参数 COUNT ；
    - 同 keys命令 一样提供模式匹配功能;
    - 服务器不需要为游标保存状态，游标的唯一状态就是 scan 返回给客户端的游标整数;
  - scan用法
    - SCAN cursor [MATCH pattern] [COUNT count]
      - scan 命令提供三个参数，第一个是cursor，第二个是要匹配的正则，第三个是单次遍历的槽位
      - 第一个遍历是 cursor 值为0，然后将返回结果的第一个整数作为下一个遍历的游标，如果最后返回的到cursor的值为0就代表结束。
- RENAME
- *[OBJECT](https://redis.io/commands/object)
- SET 设置key
- DEL 删除key
- TYPE 查看key的类型
- UNLINK，异步删除，避免阻塞主线程（redis单线程）

### string

- STRLEN key
- APPEND key value
- MSET key value [key value ...]
- MGET key1 [key2..\]]

### list

- lrange（索引从`0~N-1`（从左往右），从`-1~-N`（从右往左），因此，`0~-1`表示整个列表）
- lpop,rpop
- Bloop,brpop

### set

- 无序集合
  - SADD向集合添加一个或多个成员
  - SCARD获取集合的成员数
  - SMEMBERS返回集合中的所有成员
  - SREM移除集合中一个或多个成员
  - SSCAN用于迭代集合中键的元素
- 有序集合
  - ZADD
    - 向有序集合添加一个或多个成员，或者更新已存在成员的分数
  - ZCARD
    - 获取有序集合的成员数
  - ZRANGE
    - 通过索引区间返回有序集合指定区间内的成员
  - ZRANK
    - 返回有序集中指定成员的排名。其中有序集成员按分数值递增(从小到大)顺序排列
  - ZREVRANK
    - 返回有序集中成员的排名。其中有序集成员按分数值递减(从大到小)排序
  - ZSCORE
    - 返回有序集中，成员的分数值。 如果成员元素不是有序集 key 的成员，或 key 不存在，返回 nil 

### hash

- Redis 中每个 hash 可以存储 232 - 1 键值对（40多亿），不要随意的使用HGETALL命令因为这样可能会阻塞redis，最好使用HSCAN

### redis慢查询

Redis 慢查询有两个参数需要配置：

- `slowlog-log-slower-than`：设置慢查询预设的超时阈值，单位是微秒
- `slowlog-max-len`：表示慢查询日志存储的条数

**slowlog-log-slower-than**

`slowlog-log-slower-than` 表示的是慢查询预设的超时阈值。它所阐述的意思是如果某条命令（如 `key*`） 执行”很慢“，执行时间超过了设置的阈值，那么这条命令将会被记录到慢查询日志中。

- 若设置 `slowlog-log-slower-than=0`，则会记录所有命令
- 若设置 `slowlog-log-slower-than<0`，则不会记录任何命令

**slowlog-max-len**

Redis 会记录慢查询日志，但是会存储在哪里呢？实际上 Redis 会使用一个列表来存储慢查询日志， `slowlog-max-len` 就是该列表的最大长度。一个命令如果满足慢查询阈值条件则会加入到该列表来，但是如果该列表已经处于最大长度时，那么会删除最开始的一条记录，然后将最新的命令插入到末尾，所以慢查询日志列表是一个有限的先进先出列表

```
127.0.0.1:6379> slowlog get #慢日志查询
	 1) (integer) 2 #慢日志下标
   2) (integer) 1581994139 #执行时间
   3) (integer) 5 #花费时间 (单位微秒)
   4) 1) "set" #执行的具体命令
      2) "lang"
      3) "java"
```



1）日志的标识 id 2）发生的时间戳 3）命令耗时 4）执行的命令和参数

## redis数据过期

Redis对存储值的过期处理实际上是针对该值的键（key）处理的，即时间的设置也是设置key的有效时间。Expires字典保存了所有键的过期时间，Expires也被称为过期字段。

- expire key time(以秒为单位)--这是最常用的方式
- setex(String key, int seconds, String value)--字符串独有的方式

注：

  　　1. 除了字符串自己独有设置过期时间的方法外(对字符串特殊处理的方式为SETEX命令，  SETEX命令为指定的 key 设置值及其过期时间。如果 key 已经存在， SETEX 命令将会替换旧的值。)，其他方法都需要依靠expire方法来设置时间
  　　2. 如果没有设置时间，那缓存就是永不过期
  　　3. 如果设置了过期时间，之后又想让缓存永不过期，使用persist key

### 常用方式

一般主要包括4种处理过期方，其中expire都是以秒为单位，pexpire都是以毫秒为单位的。

```
1 EXPIRE key seconds　　//将key的生存时间设置为ttl秒
2 PEXPIRE key milliseconds　　//将key的生成时间设置为ttl毫秒
3 EXPIREAT key timestamp　　//将key的过期时间设置为timestamp所代表的的秒数的时间戳
4 PEXPIREAT key milliseconds-timestamp　　//将key的过期时间设置为timestamp所代表的的毫秒数的时间戳
1、2两种方式是设置一个过期的时间段，就是咱们处理验证码最常用的策略，设置三分钟或五分钟后失效，把分钟数转换成秒或毫秒存储到Redis中。
3、4两种方式是指定一个过期的时间 ，比如优惠券的过期时间是某年某月某日，只是单位不一样。

PERSIST(移除过期时间)
TTL(Time To Live)返回剩余生存时间，以秒为单位
PTTL以毫秒为单位返回键的剩余生存时间
```

Example:

localhost:6379> EXPIRE str3 60
(integer) 1
localhost:6379> ttl str3

过期了如何删除，先看看删除策略可分为三种：

- 定时删除(对内存友好，对CPU不友好)

- - 到时间点上就把所有过期的键删除了。

- 惰性删除(对CPU极度友好，对内存极度不友好)

- - 每次从键空间取键的时候，判断一下该键是否过期了，如果过期了就删除。

- 定期删除(折中)

- - **每隔**一段时间去删除过期键，**限制**删除的执行时长和频率

Redis采用的是**惰性删除+定期删除**两种策略，所以说，在Redis里边如果过期键到了过期的时间了，未必被立马删除的！

**为什么要采用定期删除+惰性删除2种策略呢？**

如果过期就删除。假设redis里放了10万个key，都设置了过期时间，你每隔几百毫秒，就检查10万个key，那redis基本上就死了，cpu负载会很高的，消耗在你的检查过期key上了.

但是问题是，定期删除可能会导致很多过期key到了时间并没有被删除掉，那咋整呢？所以就是惰性删除了。这就是说，在你获取某个key的时候，redis会检查一下 ，这个key如果设置了过期时间那么是否过期了？如果过期了此时就会删除，不会给你返回任何东西。

并不是key到时间就被删除掉，而是你查询这个key的时候，redis再懒惰的检查一下

通过上述两种手段结合起来，保证过期的key一定会被干掉。

所以说用了上述2种策略后，下面这种现象就不难解释了：数据明明都过期了，但是还占有着内存

## redis管道

redis的管道可以执行批量的操作，但是着并不意味着他是原子的，原声批量操作是原子的，而管道并不是。批量操作的好处是能有效的节约RTT的时间

## redis事务

redis提供了简单的事务，它不支持事务回滚，同时也无法实现命令之间的逻辑关系计算。但是同样效果lua脚本也可以实现，但是他的功能要强大的多

## Redis支持LUA脚本的主要优势

LUA脚本的融合将使Redis数据库产生的优势：

- 高效性：减少网络开销及时延，多次redis服务器网络请求的操作，使用LUA脚本可以用一个请求完成
- 数据可靠性：Redis会将整个脚本作为一个整体执行，中间不会被其他命令插入。
- 复用性：LUA脚本执行后会永久存储在Redis服务器端，其他客户端可以直接复用
- 便捷性：实现程序热更新
- 可嵌入性：可嵌入JAVA，C#等多种编程语言，支持不同操作系统跨平台交互
- 简单强大：小巧轻便，资源占用率低，支持过程化和对象化的编程语言

## redis内存管理

### redis内存信息

```
> info memory
```

| 指标                                | 含义                                                         |
| :---------------------------------- | :----------------------------------------------------------- |
| used_memory（重点关注）             | 由 Redis 分配器分配的内存总量，包含了redis进程内部的开销和数据占用的内存，以字节（byte）为单位，即当前redis使用内存大小。 |
| used_memory_human                   | 已更直观的单位展示分配的内存总量。                           |
| used_memory_rss（重点关注）         | 向操作系统申请的内存大小，与 top 、 ps等命令的输出一致，即redis使用的物理内存大小。 |
| used_memory_rss_human               | 已更直观的单位展示向操作系统申请的内存大小。                 |
| used_memory_peak                    | redis的内存消耗峰值(以字节为单位)，即历史使用记录中redis使用内存峰值。 |
| used_memory_peak_human              | 以更直观的格式返回redis的内存消耗峰值                        |
| used_memory_peak_perc               | 使用内存达到峰值内存的百分比，used_memory/ used_memory_peak) *100%，即当前redis使用内存/历史使用记录中redis使用内存峰值*100% |
| used_memory_overhead                | Redis为了维护数据集的内部机制所需的内存开销，包括所有客户端输出缓冲区、查询缓冲区、AOF重写缓冲区和主从复制的backlog。 |
| used_memory_startup                 | Redis服务器启动时消耗的内存                                  |
| used_memory_dataset                 | 数据实际占用的内存大小，即used_memory-used_memory_overhead   |
| used_memory_dataset_perc            | 数据占用的内存大小的百分比，100%*(used_memory_dataset/(used_memory-used_memory_startup)) |
| total_system_memory                 | 整个系统内存                                                 |
| total_system_memory_human           | 以更直观的格式显示整个系统内存                               |
| used_memory_lua                     | Lua脚本存储占用的内存                                        |
| used_memory_lua_human               | 以更直观的格式显示Lua脚本存储占用的内存                      |
| maxmemory                           | Redis实例的最大内存配置，默认为0，表示没有限制               |
| maxmemory_human                     | 以更直观的格式显示Redis实例的最大内存配置                    |
| maxmemory_policy                    | 当达到maxmemory时的淘汰策略                                  |
| mem_fragmentation_ratio（重点关注） | 碎片率，used_memory_rss/ used_memory。ratio指数>1表明有内存碎片，越大表明越多，<1表明正在使用虚拟内存，虚拟内存其实就是硬盘，性能比内存低得多，这是应该增强机器的内存以提高性能。一般来说，mem_fragmentation_ratio的数值在1 ~ 1.5之间是比较健康的。详解 |
| mem_allocator                       | 内存分配器                                                   |
| active_defrag_running               | 表示没有活动的defrag任务正在运行，1表示有活动的defrag任务正在运行（defrag:表示内存碎片整理）详解 |
| lazyfree_pending_objects            | 0表示不存在延迟释放的挂起对象                                |

 maxmemory_policy参数

​    1.volatile-lru(least recently used):最近最少使用算法，从设置了过期时间的键key中选择空转时间最长的键值对清除掉；

​    2.volatile-lfu(least frequently used):最近最不经常使用算法，从设置了过期时间的键中选择某段时间之内使用频次最小的键值对清除掉；

​    3.volatile-ttl:从设置了过期时间的键中选择过期时间最早的键值对清除；

​    4.volatile-random:从设置了过期时间的键中，随机选择键进行清除；

​    5.allkeys-lru:最近最少使用算法，从所有的键中选择空转时间最长的键值对清除；

​    6.allkeys-lfu:最近最不经常使用算法，从所有的键中选择某段时间之内使用频次最少的键值对清除；

​    7.allkeys-random:所有的键中，随机选择键进行删除；

​    8.noeviction:不做任何的清理工作，在redis的内存超过限制之后，所有的写入操作都会返回错误；但是读操作都能正常的进行;s

### 内存消耗划分

used_memory：

**1.自身内存**

Redis主进程本身运行肯定需要占用内存，如代码、常量池等等；这部分内存大约几兆，在大多数生产环境中与Redis数据占用的内存相比可以忽略。这部分内存不是由jemalloc分配，因此不会统计在used_memory中。

补充说明：除了主进程外，Redis创建的子进程运行也会占用内存，如Redis执行AOF、RDB重写时创建的子进程。当然，这部分内存不属于Redis进程，也不会统计在used_memory和used_memory_rss中。

**2.对象内存**

我们知道redis所有的数据基于kv数据类型，每次创建键值对，至少创建俩个对象：key对象和value对象。其中key对象都是字符串，而vaule对象主要包含5种基本类型

**3.缓冲内存**

缓冲内存包括客户端缓冲区、复制积压缓冲区、AOF缓冲区等；其中，客户端缓冲存储客户端连接的输入输出缓冲；复制积压缓冲用于部分复制功能；AOF缓冲区用于在进行AOF重写时，保存最近的写入命令。在了解相应功能之前，不需要知道这些缓冲的细节；这部分内存由jemalloc分配，因此会统计在used_memory中。

**4.内存碎片**

redis默认内存分配器采用的mem_allocator:jemalloc-5.1.0，可选的分配器还有，glibc，tcmalloc。

内存碎片是Redis在分配、回收物理内存过程中产生的。例如，如果对数据的更改频繁，而且数据之间的大小相差很大，可能导致redis释放的空间在物理内存中并没有释放，但redis又无法有效利用，这就形成了内存碎片。内存碎片不会统计在used_memory中。

内存碎片的产生与对数据进行的操作、数据的特点等都有关；此外，与使用的内存分配器也有关系：如果内存分配器设计合理，可以尽可能的减少内存碎片的产生。后面将要说到的jemalloc便在控制内存碎片方面做的很好。

如果Redis服务器中的内存碎片已经很大，可以通过安全重启的方式减小内存碎片：因为重启之后，Redis重新从备份文件中读取数据，在内存中进行重排，为每个数据重新选择合适的内存单元，减小内存碎片。

jemalloc作为Redis的默认内存分配器，在减小内存碎片方面做的相对比较好。jemalloc在64位系统中，将内存空间划分为小、大、巨大三个范围；每个范围内又划分了许多小的内存块单位；当Redis存储数据时，会选择大小最合适的内存块进行存储。所以当我们保存5kb对象是可能申请8kb的块存储剩下的不能分配给其他对象存储了。

### 优化内存占用

了解redis的内存模型，对优化redis内存占用有很大帮助。下面介绍几种优化场景。

（1）利用jemalloc特性进行优化

上一小节所讲述的90000个键值便是一个例子。由于jemalloc分配内存时数值是不连续的，因此key/value字符串变化一个字节，可能会引起占用内存很大的变动；在设计时可以利用这一点。

例如，如果key的长度如果是8个字节，则SDS为17字节，jemalloc分配32字节；此时将key长度缩减为7个字节，则SDS为16字节，jemalloc分配16字节；则每个key所占用的空间都可以缩小一半。

（2）使用整型/长整型

如果是整型/长整型，Redis会使用int类型（8字节）存储来代替字符串，可以节省更多空间。因此在可以使用长整型/整型代替字符串的场景下，尽量使用长整型/整型。

（3）共享对象

利用共享对象，可以减少对象的创建（同时减少了redisObject的创建），节省内存空间。目前redis中的共享对象只包括10000个整数（0-9999）；可以通过调整REDIS_SHARED_INTEGERS参数提高共享对象的个数；例如将REDIS_SHARED_INTEGERS调整到20000，则0-19999之间的对象都可以共享。

考虑这样一种场景：论坛网站在redis中存储了每个帖子的浏览数，而这些浏览数绝大多数分布在0-20000之间，这时候通过适当增大REDIS_SHARED_INTEGERS参数，便可以利用共享对象节省内存空间。

（4）避免过度设计

然而需要注意的是，不论是哪种优化场景，都要考虑内存空间与设计复杂度的权衡；而设计复杂度会影响到代码的复杂度、可维护性。

如果数据量较小，那么为了节省内存而使得代码的开发、维护变得更加困难并不划算；还是以前面讲到的90000个键值对为例，实际上节省的内存空间只有几MB。但是如果数据量有几千万甚至上亿，考虑内存的优化就比较必要了。

