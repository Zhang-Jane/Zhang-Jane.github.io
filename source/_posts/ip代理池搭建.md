---
title: ip代理池的搭建
tags: ip代理池
categories: ip代理池
abbrlink: e5aebd10
date: 2020-10-27 14:15:15
---
# ip搭建

### **各种IP地址的获取及接入方式**

#### vps

- VPS（Virtual Private Server 虚拟专用服务器）技术，将一台服务器分割成多个虚拟专享服务器的优质服务。实现VPS的技术分为容器技术，和虚拟化技术 [1]  。在容器或虚拟机中，每个VPS都可选配独立公网IP地址、独立操作系统、实现不同VPS间磁盘空间、内存、CPU资源、进程和系统配置的隔离，为用户和应用程序模拟出“独占”使用计算资源的体验。VPS可以像独立服务器一样，重装操作系统，安装程序，单独重启服务器。VPS为使用者提供了管理配置的自由，可用于企业虚拟化，也可以用于IDC资源租用

#### **PPPoE (家庭宽带)**

- PPP协议也叫点对点协议（英语：Point-to-Point Protocol，PPP），是一个历史悠久的协议，定义于1992年，备忘录编号RFC 1331。

  它的另外一个名字更为我们所熟知——宽带拨号。 当前我们所用的宽带连接技术，无论ADSL还是光纤接入，在数据链路层上，都使用PPP技术。我们在运营商办理宽带时，如果采用ADSL接入， 运营商会为我们提供一个ADSL Modem，如果使用光纤接入， 运营商为我们提供一个光猫，也叫ONU。 ONU 与 ADSL Modem 为我们建立了与ISP通信的物理层，我们会发现，直接将光猫或ADSL Modem上面的以太网口接入电脑是不行的， 这是因为由于运营商需要AAA，也就是 验证、授权和记账（Authentication、Authorization、Accounting ）。 在我们看来，我们需要“拨号” 才能上网。 “拨号”，就是建立了一个PPP连接。 PPP协议提供了认证的能力， 这也就是为什么我们在“拨号”的时候，可以输入 用户名、密码。 而运营商可以通过用户名和密码来对我们进行认证的原因。

  在建立了PPP连接之后， 在操作系统看来， PPP连接表现为一个网卡，当然这个网卡并不是物理上的网卡，而是一个虚拟的逻辑网卡， 与这个逻辑的网卡进行通信，PPP协议的驱动程序会自动为我们完成PPP协议的封包和拆包工作， 在我们看来，除了由于PPP协议的8个字节开销，导致MTU比正常的要小一些之外, 这个网卡和一般的物理网卡工作起来并没有什么区别。

  一般来说，在PPP连接建立之后， 远端的ISP设备， 称为BAS(接入服务器)，会为PPP链接的客户端赋予一个IP地址. 这个IP地址在几年前一般都是公网IP地址， 现在有很多是NAT过的IP地址. 它们来源于BAS服务器上配置的地址池，通常IP地址池的划分是于区县级的，也有部分城市经过改造，可能是市级，甚至是省级的。

  PPP拨号在爬虫对抗中是很可靠的IP来源，因为它与用户的IP段重合，如果服务提供商贸然封杀IP，会导致严重的误杀， 当然局限性也很大，如果想获取一个地区IP地址，就需要在这个地区架设机房。所需要的时间精力比较大。

### 获取ip的渠道

##### 1.ip的选择

很多ip代理商，代理种类也很多（私密代理，高匿名代理，隧道代理，独享代理，开放代理），价格也不一样。这种最常见，但是质量可能不太高，有很多公司会把一些代理ip公司提供的ip拉入黑名单。

一些ip可以通过https://www.ipip.net/ 来查看ip可用性

##### 2.通过vps主机拨号换ip

通过adsl拨号，切换ip，拨号可能会受vps影响，拨号可能失败，或者等待时间长。

这种方式比之前会比较麻烦，但是这种适合大规模的抓取，直接搭建一个搭建ip库。

通过把vps服务器配置成代理服务器（有的可能不支持）

程序  -> 代理服务（使用代理软件（tinyproxy或者squid），然后每次拨号切换ip） -> 互联网

**2.1. 使用TinyProxy**

Tinyproxy 是一个轻量级的开源 web 代理守护进程，其设计目标是快而小。它适用于需要完整 HTTP 代理特性，但系统资源又不足以运行大型代理的场景，比如嵌入式部署。

Tinyproxy 对小规模网络非常有用，这样的场合下大型代理会使系统资源紧张，或有安全风险。Tinyproxy 的一个关键特性是其缓冲连接的理念。从效果上看， Tinyproxy 对服务器的响应进行了高速缓冲，然后按照客户端能够处理的最高速度进行响应。该特性极大的降低了网络延滞带来的问题。

思路：

安装tinyproxy，然后启动代理服务，通过程序可以访问绑定的ip。但是这里有一个缺陷。vps是通过拨号改变ip的，ip一旦改变，程序就不知道了。

解决：

1. 这时候需要在新增一个ip管理的一个服务，来收集各个vps主机上的ip信息，然后聚合一起放入一个队列或者数据库。
2. 通过绑定域名（买一个主域名，然后每个vps配置一个子域名），在通过dns解析服务（阿里或者腾讯的dns服务），解析各个vps的ip，各个vps通过官方的接口更新ip。这样每个域名地址访问一个对应的vps，最后通过各个域名对应的变化的ip，来构建ip池。

**2.2. 使用Squid**

Squid是Web的缓存代理，支持HTTP，HTTPS，FTP等。通过缓存和重用经常请求的网页，它减少了带宽并缩短了响应时间

cache_peer的配置：

通过squid.conf配置文件中的cache_peer选项来配置代理服务器阵列，通过其他的选项来控制选择代理伙伴的方法。Cache_peer的使用格式如下：


cache_peer hostname type http_port icp_port option

共有5个选项可以配置：

1. hostname：指被请求的同级子代理服务器或父代理服务器。可以用主机名或ip地址表示；

2. type：指明hostname的类型，是同级子代理服务器还是父代理服务器，也即parent（父） 还是 sibling（子）；

3. http_port：hostname的监听端口；

4. icp_port：hostname上的ICP监听端口，对于不支持ICP协议的可指定7；

5. options：可以包含一个或多个关键

   1.  proxy-only：指明从peer得到的数据在本地不进行缓存，缺省地，squid是要缓存这部分数据的；
   2. weight=n：用于你有多个peer的情况，这时如果多于一个以上的peer拥有你请求的数据时，squid通过计算每个peer的ICP响应时间来 决定其weight的值，然后squid向其中拥有最大weight的peer发出ICP请求。也即weight值越大，其优先级越高。当然你也可以手工 指定其weight值；
   3. no-query：不向该peer发送ICP请求。如果该peer不可用时，可以使用该选项；
   4.  Default：有点象路由表中的缺省路由，该peer将被用作最后的尝试手段。当你只有一个父代理服务器并且其不支持ICP协议时，可以使用default和no-query选项让所有请求都发送到该父代理服务器；
   5. login=user:password：当你的父代理服务器要求用户认证时可以使用该选项来进行认证。
   6. round-robin：负载均衡，设置了之后会在配置的二级代理之间进行切换选取
   7. weighted-round-robin：有权重的负载均衡，同时会根据二级代理的往返时间来改变选取权重，越快的选取概率越高。
   8. more http://www.squid-cache.org/Doc/config/cache_peer/

   

```
cache_peer hostname type http-port icp-port [options]
```

例如：

```
cache_peer 58.22.22.124 parent 2053 0 no-query proxy-only weighted-round-robin login=germey:Yuy3z92hwRmJe2X6fs3BH6aWnt7xePoL
```

如果有非常多的代理池，那么可以根据这个格式来写入一个 conf 文件里面，一个代理一个，Squid 引用这个文件即可

这个 conf 文件可以保存为 peers.conf，然后在 Squid 的配置文件 squid.conf 里面引入即可，例如：

```
include /etc/squid/peers.conf
```

这样，Squid 的 cache peers 会被设置为有权重的负载均衡模式，当有请求来的时候，Squid 会随机选一个 cache peer 转发，同时 Squid 还会检测每一个 cache peer 的有效性，我们也不用再单独实现检测逻辑了，省去了一大麻烦。

嗯，利用上面的方法，我就能维护一个隧道代理了，这样一来，我就可以完成：

•爬虫的代理直接设置为该 Squid 的 host 和 port 即可。

•获取到的代理直接写入 peers.conf 配置文件里面，不用再去额外检测代理有效性，Squid 会自动检测。

•代理池的维护和取用和转发由 Squid 的 cache_peer 机制自动实现，我们不用再去关心随机选取的问题了。

 Squid 高匿代理的关键配置：

参考：https://github.com/Python3WebSpider/ProxyTunnel

```bash
request_header_access Via deny all
request_header_access X-Forwarded-For deny all
```

**优化方案**

难道我有几万个 IP，每次更新都要写入 Squid 文件吗？写入之后要重启吧，Squid 重启的时候这个代理不就没法用了吗？

这个问题，一个更好的解决方案是二级代理使用 ADSL 拨号代理服务器，peers.conf 里面配置这些 ADSL 拨号代理，这样 IP 的切换由 ADSL 拨号代理控制，本机 Squid 不用再动 peers.conf 配置文件，也不用重启了，同时还能检测拨号代理的有效性，实现永久可用。



