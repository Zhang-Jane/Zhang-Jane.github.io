---
title: windows命令
tags: windows命令
categories: windows
abbrlink: 62ff1591
date: 2022-12-16 20:32:18
---
# windows

## Windows PowerShell命令

它是一个**基于任务**的命令行终端，同时也是一个构建在 **.NET** 上的脚本语言。

在windows系统开发的可以看看[windows-powershell-cookbook](https://book.douban.com/subject/5307334/)这本书

 Get-Alias # 查看ps中的别名  
 Get-Help # 帮助手册  
 Get-Process # 查看进程  
 Set-Location（或 cd）  
 Get-ChildItem（或 dir ）  
 Where-Object 命令可以对某个列表内容或命令的输出应用各种类型的筛选条件。它的默认别名为 where 和 ?。  
 4 种格式化输出的命令：  

1. Format-Table  
2. Format-Wide  
3. Format-Custom  
4. Format-List   
   访问环境变量：  
    Get-ChildItem env:  
    输出指定的环境变量$env:USERNAME  
    访问环境变量路径：$env:path  
    使用类似于 bash 中的 >> 符号  
    直接进行简单的运算： 100 + 2   
    可以使用管道符（|）将一个命令的输出重定向至另一个命令作为输入，和 Bash 中管道符的使用一样  

 notepad.exe $Profile # 配置文件里面可以自己自定义别名

## 查找app文件

Windows+R输入 shell:AppsFolder，之后找到需要的应用，右键点击创建桌面快捷

## scoop

scoop是windows下的一个强大的包管理器可以方便快速的安装软件

### scoop安装

安装scoop很简单只需要在powershell中输入一条指令

`iwr -useb get.scoop.sh | iex`即可自动安装

但是默认是在C盘安装所以在运行之前先要更改地址

并且要让powershell可以执行脚本需要输入

`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

回车即可

之后依次输入下面的**两条指令**'D:\ScoopApp\Scoop'单引号内部的地址可以更改其他的不要动

$env:SCOOP='D:\ScoopApp\Scoop'
[Environment]::SetEnvironmentVariable('SCOOP', $env:SCOOP, 'User')

第一条指令没有问题第二条指令也一样单引号内的地址可以更改可能需要管理员身份右键wt以管理身份运行即可

$env:SCOOP_GLOBAL='D:\ScoopApp\GlobalScoopApps' [Environment]::SetEnvironmentVariable('SCOOP_GLOBAL', $env:SCOOP_GLOBAL,'Machine')

输入上两条指令之后再输入`iwr -useb get.scoop.sh | iex`即可开始安装scoop了

安装完成之后在'D:\ScoopApp\Scoop'的地方会有一个scoop的文件夹里面会有

- apps——所有通过scoop安装的软件都在里面。
- buckets——管理软件的仓库，用于记录哪些软件可以安装、更新等信息，默认添加`main`仓库，主要包含无需GUI的软件，可手动添加其他仓库或自建仓库，具体在[推荐软件仓库](https://zhuanlan.zhihu.com/write#%E6%8E%A8%E8%8D%90%E8%BD%AF%E4%BB%B6%E4%BB%93%E5%BA%93)中介绍。
- cache——软件下载后安装包暂存目录。
- persit——用于储存一些用户数据，不会随软件更新而替换。
- shims——用于软链接应用，使应用之间不会互相干扰，实际使用过程中无用户操作不必细究。

scoop有很多功能可以自行上网查看，这里只用几个最基本的需要用到的

- install——安装软件。
- uninstall——卸载软件。
- update——更新软件。可通过`scoop update *`更新所有已安装软件，或通过`scoop update`更新所有软件仓库资料及Scoop自身而不更新软件。

比如需要安装git只需要在powershell中输入命令`scoop install git`即可

scoop + 命令 + 软件名称

卸载的话就用`scoop uninstall git`

### 安装之后

安装之后用`scoop update`进行更新

之后用`scoop bucket add 仓库名` 添加仓库

常用的有以下几个

main
extras
versions
nightlies
nirsoft
php
nerd-fonts
nonportable
java
games
jetbrains

咱们需要用的默认的main和extras可以根据自己需要添加，如：

scoop bucket add main

scoop bucket add extras

scoop bucket add java

main是默认的extras里面有大量的常用的软件java的就是提供java的一些工具

添加仓库之后用`scoop update`更新

之后开始安装软件

这里推荐用一个`scoop install aria2`用来加速下载的

如果报错的话用下面的命令关闭aria2

scoop config aria2-enabled false

同理改成true即可开启

scoop config aria2-enabled true

用`scoop list`可以查看已经安装的程序

之后记住scoop install 和scoop uninstall就可以了其他的命令功能可以上官网自行查看这里用不到

## 3. 程序安装

1. zip

   首先安转一些小工具
   scoop install git
   scoop install 7zip
   scoop install aria2
   scoop install sudo
   scoop install wget
   scoop install unzip
   scoop install gzip
   scoop install ripgrep
   scoop install stylua

2. nodejs

   需要nodejs的环境

   scoop install nodejs
   之后用node --version和npm --version检查安装版本
   输出版本号说明安装成功

   windows的话可能需要重启一下环境变量才会生效

   重启之后用npm --version查看输出版本号说明安装成功

   之后用npm安装一下wsl-open`npm install -g wsl-open`

   以后wsl的话用的到

3. fd-find

   fd-find（`npm install -g fd-find`）

   - 需要node.js环境
   - 可以用`scoop install fd`之后在neovim里面`:checkhealth`一下看看

   windows的话用`scoop install fd`即可

4. lazygit

   git管理器`scoop install lazygit`

5. 安装python

   windows的话直接去官网下载安装程序运行安装程序即可

   可以参考这个

   [全网最详细的Python安装教程（Windows） - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/344887837)

   主要就是安装python添加环境变量打开powershell之后输入python --version输出版本号书名成功了

6. python的环境

   需要在安装完Python之后

   `sudo pip3 install --upgrade pynvim`

### 常见错误：

1. `raw.githubusercontent.com` 未能解析
   - 解决办法: 在`C:\Windows\System32\drivers\etc\hosts`中添加host解析：
   - `199.232.68.133 raw.githubusercontent.com`
2. `fatal: not a git repository (or any of the parent directories): .git`
   - 添加bucket时，由于网络问题，未成功添加，bucket文件夹为空。
3. `Authentication failed because the remote party has closed the transport stream.  URL xxx is not valid`
   - 更换 Scoop-Core 源，比如：https://github.com/Ash258/Scoop-Core
     scoop config proxy 127.0.0.1:7890

## win11

[cacls | Microsoft Docs](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/cacls)

cacls e://xx /G administrator:f



[attrib | Microsoft Docs](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/attrib)

attr

`attrib +a +s +h I:\document\test  `

`attrib -a -s -h I:\document\test`

`control.exe system`

### 安装wsl的准备工作

1.打开控制面板，选择程序

2.启用或关闭windows功能

3.打开`适用于Linux的Windows的子系统`，打开Hyper-V

4.bios开启虚拟化

### 安装wsl

https://learn.microsoft.com/zh-cn/windows/wsl/install

```bash
# 列出可用发行版
wsl -l -o
# 默认 Linux 发行版
wsl --setdefault <DistributionName>
```

### wsl1与wsl2切换

如果已经在windows上装过linux，执行：

C:\WINDOWS\system32>wsl -l -v NAME STATE VERSION

- Ubuntu Running 1如果是这样的，说明是wsl1，只需要：

`wsl --set-version Ubuntu 2`就可以切换为wsl2，需要几分钟。

用下面命令可以切换回wsl1：

`wsl --set-version Ubuntu 1`

### WSL修改默认安装目录到其他盘

在Windows PowerShell中输入如下命令:

1.`wsl -l --all -v`
2.导出分发版为tar文件到d盘`wsl --export Ubuntu-22.04 d:\wsl-Ubuntu-18.04.tar`

3.注销当前分发版`wsl --unregister Ubuntu-22.04`

4.重新导入并安装WSL在`d:\wsl-ubuntu22.04`

`wsl --import Ubuntu-22.04 d:\wsl-ubuntu22.04 d:\wsl-Ubuntu-22.04.tar --version 2``

#### 网络互通

WSL2 不和 Windows 共享一个 localhost，Windows 访问 WSL2 启动的网络服务，可以直接使用 localhost，但是 WSL2访问 Windows 启动的网络服务这种方式就不行了，可以使用在Ubuntu中输入以下命令查看Windows连接的IP：

ip route | grep default | awk '{print $3}'

```shell
New-NetFirewallRule -DisplayName "WSL" -Direction Inbound  -InterfaceAlias "vEthernet (WSL)"  -Action Allow

Name : {9f1ad978-3373-46d8-80c4-bca0bdca5096}  
DisplayName : WSL  
Description :  
DisplayGroup :  
Group :  
Enabled : True  
Profile : Any  
Platform : {}  
Direction : Inbound  
Action : Allow  
EdgeTraversalPolicy : Block  
LooseSourceMapping : False  
LocalOnlyMapping : False  
Owner :  
PrimaryStatus : OK  
Status : The rule was parsed successfully from the store. (65536)  
EnforcementStatus : NotApplicable  
PolicyStoreSource : PersistentStore  
PolicyStoreSourceType : Local  
RemoteDynamicKeywordAddresses : {}
```

#### 文件系统互通

WSL2 访问 Windows 文件系统依然通过挂载分区的方式，Windows 下的磁盘会被挂载在 `/mnt` 下，例如 `/mnt/c`。在 Ubuntu中，可以使用 `explorer.exe .` 可以直接打开Windows资源管理器访问当前路径的ubuntu目录，可以非常方便的跨系统处理文件。

#### wslu

wslu 是一个 WSL2 下和 Windows 系统交互的命令行工具集合

`sudo apt install wslu`

wslview：可以通过此命令调用 Windows 的默认浏览器打开 WSL2 内的超链接。使用时你可以直接把 WSL2 下的默认浏览器（即环境变量 BROWSER 设置为 wslview12），这样你就可以不用再在 WSL2 里安装浏览器，通过 wslg13 来使用浏览器了。而是可以直接打开终端上的超链接，很方便。