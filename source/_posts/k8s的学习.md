---
title: k8s的学习
tags: 容器
abbrlink: da8849fb
date: 2023-03-18 21:06:38
---
# K8s的学习

## 不同的部署方式

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/w5VLqXvJAmBxlX19/img/5ed37452-4d52-4de4-b589-ddea01b035c2.svg)    

## 硬件资源级的虚拟化--Hypervisor

一个hypervisor（又被称为virtual machine monitor，VMM，或virtualizer）是一种模拟器；它是创建或者运行虚拟机的软件、固件、或者硬件。一个计算机，上面运行着一个hypervisor，hypervisor上面又运行着一个或多个虚拟机，该计算机被称为host machine，每一个虚拟机被叫做guest machine。hypervisor为guest operating system营造了一个虚拟的操作系统，并且对guest operating system的运行进行管理。多个不同的操作系统能够共享虚拟化的硬件资源：例如，Linux，Windows，macOS实例能够在一个单独的物理x86机器上运行。这与操作系统级虚拟化技术不同，该技术让所有的实例共享一个内核（所谓操作系统级虚拟化技术就是指容器），即使guest operating system能够在user space不同，例如有同样的内核的Linux distribution。

## 操作系统级的虚拟化--容器docker

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/w5VLqXvJAmBxlX19/img/41b9734e-4daf-4256-b5e2-4588b191d6b5.png)



## docker和Hypervisor-虚拟化

Docker容器与虚拟机类似，但二者在原理上不同。容器是将操作系统层虚拟化，虚拟机则是虚拟化硬件，因此容器更具有便携性、更能高效地利用服务器。 容器更多的用于表示软件的一个标准化单元。由于容器的标准化，因此它可以无视基础设施（Infrastructure）的差异，部署到任何一个地方。另外，Docker也为容器提供更强的业界的隔离兼容。

## docker重要的概念

Docker 中有三个重要概念。

- 镜像（Image）：
  - Docker 镜像是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。镜像不包含任何动态数据，其内容在构建之后也不会被改变
- 容器（Container）：
  - 镜像（Image）和容器（Container）的关系，就像是面向对象程序设计中的类和实例 一样，镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。

**容器的实质是进程，但与直接在宿主执行的进程不同，容器进程运行于属于自己的独立的命名空间。因此容器可以拥有自己的 root 文件系统、自己的网络配置、自己的进程空间，甚至自己的用户 ID 空间。容器内的进程是运行在一个隔离的环境里，使用起来，就好像是在一个独立于宿主的系统下操作一样。这种特性使得容器封装的应用比直接在宿主运行更加安全**

- 仓库（Repository）：
  - 镜像构建完成后，可以很容易的在当前宿主机上运行，但是，如果需要在其它服务器上使用这个镜像，我们就需要一个集中的存储、分发镜像的服务，Docker Registry 就是这样的服务。

**一个 Docker Registry 中可以包含多个 仓库（Repository）；每个仓库可以包含多个 标签（Tag）；每个标签对应一个镜像。**

**制作docker容器：**

- **制作过程类似：类似于“package.json” -> VImage: 类似于“Win8纯净版.rar” -> VContainer: 一个完整操作系统**

## k8s（Kubernetes）

### 为什么叫k8s？

**k8s = K + 后八位字母 + s**

### k8s中几个重要概念

详细可查：[https://kubernetes.io/zh-cn/docs/concepts/overview/](https://kubernetes.io/zh-cn/docs/concepts/overview/)

**master**

master负责整个集群的管理和控制；master上运行着三个关键进程，kube-apiserver、kube-controller-manager、kube-scheduler;

**node**

node是kubernetes中的负载节点；node上也运行着三个关键进程，kubelet、kube-proxy、容器runtime。

**pod**

豆荚，K8S 调度、管理的最小单位，一个 Pod 可以包含一个或多个容器，每个 Pod 有自己的虚拟IP。一个工作节点可以有多个 pod，主节点会考量负载自动调度 pod 到哪个节点运行。

#### Kubernetes 组件

控制平面组件：

kube-apiserver API 服务器，公开了 Kubernetes APIetcd 键值数据库，可以作为保存 Kubernetes 所有集群数据的后台数据库kube-scheduler 调度 Pod 到哪个节点运行kube-controller 集群控制器cloud-controller 与云服务商交互

Node 组件：

kubelet 会在集群中每个节点（node）上运行。 它保证容器（containers）都运行在 Pod 中

kube-proxy 是集群中每个节点（node）上所运行的网络代理，

Container Runtime  容器运行环境是负责运行容器的软件。

#### 命令行工具 (kubectl)

**yaml文件配置：**

- YAML的语法规则
  - 大小写敏感
  - 使用缩进表示层级关系
    - 缩进时不允许使用Tab键，只允许使用空格
  - 缩进的空格数不重要，只要相同层级的元素左侧对齐即可
  - "表示注释
  - 注：在同一个yaml配置文件内可以同时定义多个资源
- YAML支持的数据结构
  - 对象：键值对的集合，又称为映射（mapping）/ 哈希（hashes） / 字典（dictionary）
  - 数组：一组按次序排列的值，又称为序列（sequence） / 列表（list）
  - 纯量（scalars）：单个的、不可再分的值

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/w5VLqXvJAmBxlX19/img/b26565fa-49fc-451e-896b-65d83d07a6b5.png)

**配置核心说字段说明：**

- apiVersion
  - 这个版本号需要根据安装的Kubernetes版本和资源类型进行变化，不是写死的。
- kind
  - 此处创建的是Pod，根据实际情况，此处资源类型可以是Deployment、Job、Ingress、Service等。
- metadata
  - 包含Pod的一些meta信息，比如name名称、namespace、labels标签等信息。
- spec
  - 包括一些container，storage，volume以及其他Kubernetes需要的参数，以及诸如是否在容器失败时重新启动容器的属性。可在特定Kubernetes API找到完整的Kubernetes Pod的属性。

**kubectl run(在集群中创建并运行一个或多个容器镜像)**

示例，运行一个名称为nginx，副本数为3，标签为app=example，镜像为nginx:1.10，端口为80的容器实例 $ kubectl run nginx --replicas=3 --labels="app=example" --image=nginx:1.10 --port=80 # 示例，运行一个名称为nginx，副本数为3，标签为app=example，镜像为nginx:1.10，端口为80的容器实例，并绑定到k8s-node1上

**yaml部署：**

```
# 部署应用
kubectl apply -f app.yaml
# 查看 deployment
kubectl get deployment
# 查看 pod
kubectl get pod -o wide
# 查看 pod 详情
kubectl describe pod pod-name
# 查看 log
kubectl logs pod-name
# 进入 Pod 容器终端， -c container-name 可以指定进入哪个容器。
kubectl exec -it pod-name -- bash
# 伸缩扩展副本
kubectl scale deployment test-k8s --replicas=5
# 把集群内端口映射到节点
kubectl port-forward pod-name 8090:8080
# 查看历史
kubectl rollout history deployment test-k8s
# 回到上个版本
kubectl rollout undo deployment test-k8s
# 回到指定版本
kubectl rollout undo deployment test-k8s --to-revision=2
# 删除部署
kubectl delete deployment test-k8s
```

#### k8s的部署的模式

##### 无状态服务

概念：

- 无状态服务不会在本地存储持久化数据
- 多个服务实例对于同一个用户请求的响应结果是完全一致的
- 这种多服务实例之间是没有依赖关系，比如web应用，在k8s控制器中动态启停无状态服务的pod并不会对其它的pod产生影响。

特性：

- 无状态服务内的多个Pod创建的顺序是没有顺序的
- 无状态服务内的多个Pod的名称是随机的，pod被重新启动调度后，它的名称与IP都会发生变化
- 无状态服务内的多个Pod背后是共享存储的

```yaml
apiVersion: apps/v1 # 设置api版本，1.9.0 之前的版本使用 apps/v1beta2
kind: Deployment # 指定创建资源的角色/类型
metadata:
  name: nginx-deployment-basic # 资源的元数据/属性
  labels:
    app: nginx
spec: # 资源对象的具体描述
  replicas: 2 # 副本数量2
  selector:
    matchLabels:
      app: nginx # 定义标签选择器
  template: # 这里Pod的定义
    metadata:
      labels: # Pod的label
        app: nginx # 指定该资源的内容
    spec:
    #  nodeSelector:
    #    env: test-team
      containers:
      - name: nginx # 容器的名字
        image: nginx:1.7.9 # replace it with your exactly <image_name:tags>
        ports:
        - containerPort: 80 # 容器对外的端口
        resources:
          limits: # 资源限制
            cpu: "0.1" # 表达式 0.1 等价于表达式 100m，可以看作 “100 millicpu”
```



##### 有状态服务

概念：

有状态服务需要在本地存储持久化数据，典型的是分布式数据库的应用，分布式节点实例之间有依赖的拓扑关系。比如：主从关系，如果K8S停止分布式集群中任 一实例pod，就可能会导致数据丢失或者集群的故障

特性：

Kubernetes 使用Stateful管理有状态的应用，它的Pod有如下特征：

● 唯一性: 每个Pod会被分配一个唯一序号.

● 顺序性: Pod启动，更新，销毁是按顺序进行.

● 稳定的网络标识: Pod主机名，DNS地址不会随着Pod被重新调度而发生变化.

● 稳定的持久化存储: Pod被重新调度后，仍然能挂载原有的PV，从而保证了数据的完整性和一致性

**PVC和PV**

- PVC 是 PersistentVolumeClaim 的缩写，译为存储声明；PVC 是在 K8s 中一种抽象的存储卷类型，代表了某个具体类型存储的数据卷表达。其设计意图是：存储与应用编排分离，将存储细节抽象出来并实现存储的编排（存储卷）。这样 K8s 中存储卷对象独立于应用编排而单独存在，在编排层面使应用和存储解耦。
- PV 是 PersistentVolume 的缩写，译为持久化存储卷；PV 在 K8s 中代表一个具体存储类型的卷，其对象中定义了具体存储类型和卷参数。即目标存储服务所有相关的信息都保存在 PV 中，K8s 引用 PV 中的存储信息执行挂载操作。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: "my-stateful-app" #TODO: repliace it with your app name
spec:
  selector:
    matchLabels:
      app: my-stateful-app
  replicas: 1
  template:
    metadata:
      name: "my-stateful-app"
      labels:
        app: my-stateful-app
    spec:
      containers:
      - name: nginx
        image: nginx:1.7.9 #TODO: replace it with your exactly <image_name:tags>
        ports:
        - containerPort: 80
```

##### 定时任务

所谓定时任务，就是指基于时间调度的任务，它会对所定义的定时任务资源进行基于时间的周期性调度，类似于linux中的crontab

```yaml
由于任务 pi 在配置时指定了 spec.completions=10，所以当前的任务需要等待 10 个 Pod 的成功执行，另一个比较重要的 spec.parallelism=5 表示最多有多少个并发执行的任务，如果 spec.parallelism=1 那么所有的任务都会依次顺序执行，只有前一个任务执行成功时，后一个任务才会开始工作。apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: pi
spec:
  schedule: "*/1 * * * *"
  jobTemplate:
    spec:
      completions: 10
      parallelism: 5
      template:
        spec:
          containers:
          - name: pi
            image: perl
            command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
          restartPolicy: OnFailure
```

