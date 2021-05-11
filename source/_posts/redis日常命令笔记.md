---
title: redis日常命令笔记
date: 2021-05-11 17:47:15
tags: redis
categories: redis
---

## redis命令

### rename-command

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
- [OBJECT](https://redis.io/commands/object)
- SET 设置key
- DEL 删除key
- TYPE 查看key的类型
- UNLINK，异步删除，避免阻塞主线程（redis单线程）

### string

### list

- lrange（索引从0~N-1（从左往右），从-1~-N（从右往左），因此，0~-1表示整个列表）
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

### redis内存信息

```
> info memory
```

| 指标                      | 含义                                                         |
| :------------------------ | :----------------------------------------------------------- |
| used_memory               | 由 Redis 分配器分配的内存总量，包含了redis进程内部的开销和数据占用的内存，以字节（byte）为单位，即当前redis使用内存大小。 |
| used_memory_human         | 已更直观的单位展示分配的内存总量。                           |
| used_memory_rss           | 向操作系统申请的内存大小，与 top 、 ps等命令的输出一致，即redis使用的物理内存大小。 |
| used_memory_rss_human     | 已更直观的单位展示向操作系统申请的内存大小。                 |
| used_memory_peak          | redis的内存消耗峰值(以字节为单位)，即历史使用记录中redis使用内存峰值。 |
| used_memory_peak_human    | 以更直观的格式返回redis的内存消耗峰值                        |
| used_memory_peak_perc     | 使用内存达到峰值内存的百分比，used_memory/ used_memory_peak) *100%，即当前redis使用内存/历史使用记录中redis使用内存峰值*100% |
| used_memory_overhead      | Redis为了维护数据集的内部机制所需的内存开销，包括所有客户端输出缓冲区、查询缓冲区、AOF重写缓冲区和主从复制的backlog。 |
| used_memory_startup       | Redis服务器启动时消耗的内存                                  |
| used_memory_dataset       | 数据实际占用的内存大小，即used_memory-used_memory_overhead   |
| used_memory_dataset_perc  | 数据占用的内存大小的百分比，100%*(used_memory_dataset/(used_memory-used_memory_startup)) |
| total_system_memory       | 整个系统内存                                                 |
| total_system_memory_human | 以更直观的格式显示整个系统内存                               |
| used_memory_lua           | Lua脚本存储占用的内存                                        |
| used_memory_lua_human     | 以更直观的格式显示Lua脚本存储占用的内存                      |
| maxmemory                 | Redis实例的最大内存配置，默认为0，表示没有限制               |
| maxmemory_human           | 以更直观的格式显示Redis实例的最大内存配置                    |
| maxmemory_policy          | 当达到maxmemory时的淘汰策略                                  |
| mem_fragmentation_ratio   | 碎片率，used_memory_rss/ used_memory。ratio指数>1表明有内存碎片，越大表明越多，<1表明正在使用虚拟内存，虚拟内存其实就是硬盘，性能比内存低得多，这是应该增强机器的内存以提高性能。一般来说，mem_fragmentation_ratio的数值在1 ~ 1.5之间是比较健康的。详解 |
| mem_allocator             | 内存分配器                                                   |
| active_defrag_running     | 表示没有活动的defrag任务正在运行，1表示有活动的defrag任务正在运行（defrag:表示内存碎片整理）详解 |
| lazyfree_pending_objects  | 0表示不存在延迟释放的挂起对象                                |

 maxmemory_policy参数

​    1.volatile-lru(least recently used):最近最少使用算法，从设置了过期时间的键key中选择空转时间最长的键值对清除掉；

​    2.volatile-lfu(least frequently used):最近最不经常使用算法，从设置了过期时间的键中选择某段时间之内使用频次最小的键值对清除掉；

​    3.volatile-ttl:从设置了过期时间的键中选择过期时间最早的键值对清除；

​    4.volatile-random:从设置了过期时间的键中，随机选择键进行清除；

​    5.allkeys-lru:最近最少使用算法，从所有的键中选择空转时间最长的键值对清除；

​    6.allkeys-lfu:最近最不经常使用算法，从所有的键中选择某段时间之内使用频次最少的键值对清除；

​    7.allkeys-random:所有的键中，随机选择键进行删除；

​    8.noeviction:不做任何的清理工作，在redis的内存超过限制之后，所有的写入操作都会返回错误；但是读操作都能正常的进行;

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

## Redis支持LUA脚本的主要优势

LUA脚本的融合将使Redis数据库产生的优势：

- **高效性：**减少网络开销及时延，多次redis服务器网络请求的操作，使用LUA脚本可以用一个请求完成
- **数据可靠性：**Redis会将整个脚本作为一个整体执行，中间不会被其他命令插入。
- **复用性：**LUA脚本执行后会永久存储在Redis服务器端，其他客户端可以直接复用
- **便捷性：**实现程序热更新
- **可嵌入性：**可嵌入JAVA，C#等多种编程语言，支持不同操作系统跨平台交互
- **简单强大：**小巧轻便，资源占用率低，支持过程化和对象化的编程语言



