---
title: zookeeper
abbrlink: 3ad834c9
date: 2022-12-25 23:25:46
tags:
---
## 概述

Zookeeper是一个开源的分布式的，为分布式应用提供协调服务的Apache项目。

工作机制：

是一个基于观察者模式设计的分布式服务管理框架，它负责存储和管理大家都关心的数据，然后接收观察者的注册，一旦这些数据状态发生变化，Zookeeper就将负责通知已经在Zookeeper上的那些观察者做出相应的反应。

![](../images/zookeeper/zookeeper%E5%B7%A5%E4%BD%9C%E6%9C%BA%E5%88%B6.png)

## 特点

![](../images/zookeeper/zookeeper%E7%89%B9%E7%82%B9.png)

## 数据结构

![](../images/zookeeper/zookeeper%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.png)

每个节点既能存数据也能有子节点