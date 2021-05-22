---
title: 常用的linux命令
tags: linux命令
categories: linux
abbrlink: 4074d3b3
date: 2021-05-11 17:29:37
---

# 常用的linux命令

## 帮助命令tldr

## du

du -sh ./* | grep "G" | sort

du -h --max-depth=1 -I

du -ah

## wget

wget：

 -c 断点续传

-b 后台下载文件

--limit-rate=100k 限制下载速率

https://linuxtools-rst.readthedocs.io/zh_CN/latest/tool/wget.html

## kill端口占用lsof

- netstat -tunplp | grep 端口号，命令用于显示tcp，udp的端口和进程等相关情况

- 使用 lsof -i 命令

  - ```css
    lsof  -i:<port>
    lsof  -iTCP
    lsof  -iUDP
    ```

- 利用 kill -9 PID 干掉目标进程

## curl

curl https://blog.csdn.net/daiyu__zz/article/details/84887211 -x https://127.0.0.1:9991

curl https://hungerstation.com/sa-en/restaurants/riyadh/al-rawdah  -x  https://45.131.177.36:3389

测试网站响应时间

time_connect：建立到服务器的 TCP 连接所用的时间
time_starttransfer：在发出请求之后，Web 服务器返回数据的第一个字节所用的时间
time_total：完成请求所用的时间

```
curl -o /dev/null -s -w "time_connect: %{time_connect}\ntime_starttransfer: %{time_starttransfer}\ntime_total: %{time_total}\n" "http://www.zhengdazhi.com"
```

post请求：

-H指的是请求的头信息，多个头信息加多个-H即可，-d用于指定的发送的数据，-X用于指定请求的方式

-A自定义用户代理

curl -v www.baidu.com

## 补充

```
stat
file 查看文件类型
cut

paste 合并文件
paste -s file 合并指定文件的多行数据
按行合并，即数据是一行一行拼接，用cat
按列合并，则用paste

cut
-b ：以字节为单位进行分割。这些字节位置将忽略多字节字符边界，除非也指定了 -n 标志。
-c ：以字符为单位进行分割。
-d ：自定义分隔符，默认为制表符。
-f ：与-d一起使用，指定显示哪个区域。
-n ：取消分割多字节字符。仅和 -b 标志一起使用。如果字符的最后一个字节落在由 -b 标志的 List 参数指示的范围之内，该字符将被写出；否则，该字符将被排除

uniq
-c或--count 在每列旁边显示该行重复出现的次数。
-d或--repeated 仅显示重复出现的行列。
-f<栏位>或--skip-fields=<栏位> 忽略比较指定的栏位。
-s<字符位置>或--skip-chars=<字符位置> 忽略比较指定的字符。
-u或--unique 仅显示出一次的行列。
```

## 统计重复的信息

```
grep " Crawled (200)" as_talabat_area_restaurants_21_2021-02-15_14:03:01.log | grep -Eo "http(.*)>" | uniq -d

grep " Crawled (200)" as_talabat_area_restaurants_21_2021-02-15_14:03:01.log | awk '{print $10}'

```

## Linux系统中暂停正在运行的进程并放入后台

1. ctrl+z键 （暂停终端命令窗口正在运行的进程）

2. bg %1 （将暂停的进程放入后台运行）

3. jobs （查看后台运行的进程
4. bg命令基本格式为 bg %工作号（可通过jobs命令查看暂停和后台运行的进程工作号）

## watch

 watch -n 1 tail -f as_nio_jiadian_charger_by_lat_2021-02-23_11:06:01.log

## 断点续传 rsync

## scp

**SCP拷贝命令中常用的几个参数说明**

```
-B  使用批处理模式（传输过程中不询问传输口令或短语） 
-C  允许压缩。（将-C标志传递给ssh，从而打开压缩功能） 
-p  保留原文件的修改时间，访问时间和访问权限。 
-q  不显示传输进度条。 
-r  递归复制整个目录。 
-v 详细方式显示输出。scp和ssh(1)会显示出整个过程的调试信息。这些信息用于调试连接，验证和配置问题。  
-c cipher  以cipher将数据传输进行加密，这个选项将直接传递给ssh。  
-F ssh_config  指定一个替代的ssh配置文件，此参数直接传递给ssh。 
-i identity_file  从指定文件中读取传输时使用的密钥文件，此参数直接传递给ssh。   
-l limit  限定用户所能使用的带宽，以Kbit/s为单位。    
-o ssh_option  如果习惯于使用ssh_config(5)中的参数传递方式，  
-P port  注意是大写的P, port是指定数据传输用到的端口号  
-S program  指定加密传输时所使用的程序。此程序必须能够理解ssh(1)的选项。
```

正常传输：

scp jane@106.75.26.184:/home/jane/plist ~/Downloads

限制传输带宽：

注意**：Kbit/s为单位**，b代表bit,指一位,B代表byte,指一字节,1B=8b

scp -l 15000 jane@106.75.26.184:/home/jane/plist ~/Downloads

## top

Linux 系统里的进程状态:https://liam.page/2020/01/10/the-states-of-processes-on-Linux/

## 批量kill进程

```shell
 ps -aux | grep "scrapy crawl shop_spider" | grep -v "grep" |cut -c 9-15 | xargs kill
 
 ps -ef | grep "关键词" | awk '{print $2}' | xargs kill
 multi_process_task3.py
 ps -ef | grep -w "traverse_id" | awk '{print $2}' | xargs kill
 
ps -ef | grep "scrapy crawl shop_spider" | awk '{print $2}' | xargs kill
```

## 日志查询scrapy请求的数量

```bash
//查询上下
git log |grep "xxxx" -C 5

//查询往后 after
git log |grep "xxxx" -A 5

//查询往前 before
git log |grep "xxxx" -B 5
	
cat box_online_2020-12-16 | grep "2020-12-16 15.*授权超时需要重新登录"

cat box_online_2020-11-27 | grep "downloader/request_count"

cat box_online_2020-11-27 | grep "授权超时需要重新登录"

cat box_online_2020-11-26 | grep "Dumping Scrapy stats:" -A 10

cat box_online_2020-11-26 | grep "downloader/request_count" | wc -l

//列出最新的日志文件
ll -t | grep elong_hotel_list | head -1 | awk '{print $9}'
```



## 日志分析命令

| 操作             | 命令                             | 说明                                             |
| ---------------- | -------------------------------- | ------------------------------------------------ |
| 查看文件的内容   | cat -n access.log                | -n显示行号                                       |
| 分页显示文件     | more access.log                  | Enter下一行，空格下一页，F下一屏，B上一屏        |
| 分页显示文件     | less access.log                  | 输入 /字符串 可查找并高亮                        |
| 显示文件尾       | tail -n2 -f access.log           | -n2显示最后2行，-f继续监听不退出                 |
| 内容排序         | sort -k 2 -t ' ' -n access.log   | -k指定排序列，-t指定列分隔符，-n按数字顺序       |
| 字符统计         | wc -l access.log                 | -l统计行数，-c字符数，-L最长行长度，-w单词数     |
| 查看重复出现的行 | sort testfile \| uniq -c -d      | uniq去重，-c统计重复次数，-d只显示重复的         |
| 字符串查找       | grep 'G.*T' access.log           | 查找G开头T结尾的字符串                           |
| 文件查找         | find /home/java -name access.log | 递归/home/java的子目录找名为access.log           |
| 表达式求值       | expr 10 \* 3                     | 计算10*3，其中\*表示转义*不解读为通配符          |
| 表达式求值       | expr length "this is a test"     | 计算长度                                         |
| 归档文件         | tar -cf aaa.tar f1 f2            | -c创建，-f指定包名                               |
| 归档文件         | tar -xf aaa.tar                  | -x解压                                           |
| URL访问          | curl www.google.com              | 不带参返回响应体，-i返回带响应头，-I仅返回响应头 |
| 查看CPU的load    | uptime                           |                                                  |
| 查看CPU使用率    | top \| grep Cpu                  | 按1查看每个核，按shift+H按线程查看               |
| 查看CPU使用率    | top -p 2864                      | 查看指定进程                                     |
| 磁盘剩余空间     | df -h                            |                                                  |
| 磁盘剩余空间     | du -d 1 -h /home/java            | 分析目录的磁盘使用。-d设置递归深度               |
| 网络traffic      | sar -n DEV 1 1                   | DEV查看各个网卡，1秒抽样，1总共取一次            |
| 磁盘I/O          | iostat -d -k                     |                                                  |
| 内存使用         | free -m                          | 通常是看“-/+ buffers/cache”对应的used和free      |
| 内存使用         | vmstat                           | 查看swap I/O                                     |

## sed行编辑器

### P（显示）模式

sed  -n  ‘/^#/p’  fstab            //显示以“#”开头的行
sed   -n  ‘/UUID$/P’  fstab    //显示以UUID结尾的行
sed  -n  ‘2,6P’  fstab             //显示2到6行
sed  -n  ‘2,6!P’  fstab            //不显示2到6行
sed  -n  ‘2p;6p’  fstab           //显示第2行和第6行

## grep

### 常用选项：

​		-m, --max-count=NUM       NUM 次匹配后停止

　　-E ：开启扩展（Extend）的正则表达式。或者直接使用egrep

　　-i ：忽略大小写（ignore case）。

　　-v ：反过来（invert），只打印没有匹配的，而匹配的反而不打印。

　　-n ：显示行号

　　-w ：被匹配的文本只能是单词，而不能是单词中的某一部分，如文本中有liker，而我搜寻的只是like，就可以使用-w选项来避免匹配liker

　　-c ：显示总共有多少行被匹配到了，而不是显示被匹配到的内容，注意如果同时使用-cv选项是显示有多少行没有被匹配到。

　　-o ：只显示被模式匹配到的字符串。

　　--color :将匹配到的内容以颜色高亮显示。

　　-A  n：显示匹配到的字符串所在的行及其后n行，after

　　-B  n：显示匹配到的字符串所在的行及其前n行，before

　　-C  n：显示匹配到的字符串所在的行及其前后各n行，context

## awk

$0代表整行所有数据，$1代表第一列

NF是个代表总列数的系统变量，所以$NF代表最后一列，还支持$(NF-1)来表示倒数第二列。

还支持列之间的运算，如$NF-$(NF-1)是最后两列的值相减。

只写一个print 是 print $0的简写，打印整行所有数据。

默认以空格做分割符，也可以重新指定:

​	-F 

```
# 使用","分割
awk -F, '{print $1,$2}'   log.txt
```