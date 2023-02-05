---
title: python开发环境
tags: python开发环境
categories: python开发环境
abbrlink: '34964073'
date: 2020-10-17 20:00:31
---
# python开发环境

## python的环境

### env

The venv module provides support for creating lightweight “virtual environments” with their own site directories, optionally isolated from system site directories. Each virtual environment has its own Python binary (which matches the version of the binary that was used to create this environment) and can have its own independent set of installed Python packages in its site directories.

Venv 模块支持创建具有自己站点目录的轻量级“虚拟环境” ，可以选择从系统站点目录中隔离出来。每个虚拟环境都有自己的 Python 二进制文件(与用于创建此环境的二进制文件的版本相匹配) ，并且可以在其站点目录中拥有自己独立安装的 Python 包集。

[文档](https://docs.python.org/3/library/venv.html)

## virtualenv

Virtualenv 是一个创建独立 Python 环境的工具

https://virtualenv.pypa.io/en/latest/

#### [virtualenvwrapper](https://pypi.org/project/virtualenvwrapper)

virtualenv 的一组扩展

## pyenv(pyenv官方不支持 Windows 系统，但是也可以用https://github.com/pyenv-win/pyenv-win)
https://github.com/pyenv/pyenv#windows

pyenv lets you easily switch between multiple versions of Python. It's simple, unobtrusive, and follows the UNIX tradition of single-purpose tools that do one thing well.


- `pyenv`：简单的 Python 版本管理工具。
- `virtualenv`：创建独立 Python 环境的工具。
- `virtualenvwrapper`：virtualenv 的一组扩展。

```
~/.bash_profile: 每个用户都可使用该文件输入专用于自己使用的shell信息,当用户登录时,该文件仅仅执行一次!默认情况下,他设置一些环境变量,执行用户的.bashrc文件.
~/.bashrc: 该文件包含专用于你的``bash` `shell的``bash``信息,当登录时以及每次打开新的shell时,该该文件被读取.

```

Ubuntu的环境

### 第一步

sudo apt-get update

安装依赖库

```
sudo apt-get install git gcc make openssl libssl-dev libbz2-dev libreadline-dev libsqlite3-dev
```

### 安裝pyenv

https://github.com/pyenv/pyenv

```bash
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n eval "$(pyenv init -)"\nfi' >> ~/.bashrc
```

在使用 pyenv 之前，重新初始化 shell 环境，执行如下命令

```bash
exec $SHELL
```

```
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev \
xz-utils tk-dev libffi-dev liblzma-dev python-openssl git
```



### 安裝virtualenv

https://github.com/pyenv/pyenv-virtualenv

1. **Check out pyenv-virtualenv into plugin directory**

   ```bash
   $ git clone https://github.com/pyenv/pyenv-virtualenv.git $(pyenv root)/plugins/pyenv-virtualenv
   ```


1. (OPTIONAL) **Add `pyenv virtualenv-init` to your shell** to enable auto-activation of virtualenvs. This is entirely optional but pretty useful. See "Activate virtualenv" below.

   ```bash
   $ echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bash_profile
   ```

   **Fish shell note**: Add this to your `~/.config/fish/config.fish`

   ```bash
   status --is-interactive; and pyenv init - | source
   status --is-interactive; and pyenv virtualenv-init - | source
   ```

   **Zsh note**: Modify your `~/.zshenv` file instead of `~/.bash_profile`.

   **Pyenv note**: You may also need to add `eval "$(pyenv init -)"` to your profile if you haven't done so already.

2. **Restart your shell to enable pyenv-virtualenv**

   ```bash
   $ exec "$SHELL"
   ```

### pyenv使用

#### 安装python的版本

```bash
v=3.7.2;wget https://npm.taobao.org/mirrors/python/$v/Python-$v.tar.xz -P ~/.pyenv/cache/;pyenv install $v 
```

#### 查看 pyenv 已经托管了哪些 python 版本

```
pyenv versions
```

#### 选择python版本

pyenv global 3.5.0 //设置全局版本，即系统使用的将是此版本

pyenv local 3.5.0 //当前目录下的使用版本，有点类似virtualenv

### 安装virtualenvwrapper

```bash
pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple virtualenvwrapper
```

配置环境

```bash
  
echo 'export WORKON_HOME="/home/jane/.virtualenv/"' >> ~/.bashrc
source /home/jane/.pyenv/versions/3.7.2/bin/virtualenvwrapper.sh
```

### virtualenvwrapper使用

#### 创建虚拟环境

利用 virtualenvwrapper，我们可以使用下面的命令轻松创建一个虚拟环境。

> mkvirtualenv spider

之后我们就有了一个叫做 spider 的虚拟环境。它被存放在 $WORKON_HOME/spider 目录下。

##### 新建虚拟环境之后会自动激活虚拟环境。如果我们平时想要进入某个虚拟环境，可以用下面的命令。

> workon spider

这也就是为什么环境变量中存放虚拟环境的目录为啥叫做WORKON_HOME。顺便说一句，workon 后面可是可以支持用 tab自动补全的哟。

##### 同样，离开虚拟环境，可以使用。

> deactivate

##### 另外，删除虚拟环境也一样简单。

> rmvirtualenv spider




## Python 虚拟环境和依赖管理工具

### Pipenv

Pipenv 是 Python.org 官方推进的 Python 包管理工具，旨在将所有包管理工具（如 bundler、composer、npm、cargo、yarn 等）的优点集中应用于 Python 领域中的工具。它对各个平台都有很好的支持。

Pipenv 可以为你的项目自动创建和管理虚拟环境，并且在你安装/删除包时自动在 Pipfile 中添加/移除相应的包。它同时生成一个非常重要的 Pipfile.lock 文件，来保证所构建环境的确定性。

**相当于自动帮你集成了pip 和 virtualenv的管理**

### Poetry

是一个 Python 虚拟环境和依赖管理工具，另外它还提供了包管理功能，比如打包和发布等。

https://python-poetry.org/docs/

### Miniconda

摘录：http://greyli.com/miniconda-is-another-good-choice/

对于常规的 Python 开发来说，Anaconda 太重了，而且主要面向科学计算领域，但是精简版的 Miniconda 却是一个很好的 Python 版本和虚拟环境管理工具。

更重要的是 Miniconda 兼容三个主流操作系统，而且不同平台使用同样的命令和接口（Conda 4.6 以上）。这大概算是个人偏好，因为我总在写东西给别人看，所以总是喜欢兼容主流操作系统并且接口统一的解决方案。而且另一方面 pyenv、virtualenvwrapper、direnv 等等相关替代工具都没有原生 Windows 支持

先来理清几个概念：

- Conda：包、依赖和环境管理器。
- Anaconda（某种蟒蛇的名字）：面向数据科学的 Python 发行版，包含 conda、conda-build、Python 和 100+ 常用的数据科学常用的库及其依赖。
- Miniconda：精简版的 Anaconda，也是一个 Python 发行版，只包含 conda、Python 和一些基本的包。


# windows下虚拟环境的安装与配置

## 1.安装虚拟环境

```
pip install virtualenv 
```

## **2.通过豆瓣源安装，寻找python豆瓣源镜像**

 豆瓣源路径：https://pypi.douban.com/simple

```
pip install -i https://pypi.douban.com/simple/ django   #安装
pip uninstall django  #卸载
```

 

## **3.新建 virtualenv，新建虚拟环境**

- 选择一个用来存放虚拟环境的文件，如E:/python3

```
cd E:python3  # 进入该文件
virtualenv envname   # 创建一个名字为envname的虚拟环境
dir     # 查看当前目录可以知道一个envname的文件已经被创建
virtualenv -p python2 envname  # 如果安装了多个python版本，如py2和py3，需要指定使用哪个创建虚拟环境
```

 

**注意：**

- 如果不识别virtualenv命令，可能是python安装路径没添加到系统环境变量或没安装virtualenv或没有重新打开一个cmd窗口；
- 启动虚拟环境

```
cd envname # 进入虚拟环境文件
cd Scripts # 进入相关的启动文件夹

activate  # 启动虚拟环境
deactivate # 退出虚拟环境
```

 

## 4.virtualenvwrapper，新建虚拟环境

```
pip install virtualenvwrapper-win # 虚拟环境管理包
workon #显示所有虚拟环境
mkvirtualenv py3scrapy  #新建虚拟环境，默认放在C盘Envs中,可以创建环境变量WORKON_HOME,E:\python3\Envs,将Envs放在自己想要的位置
deactivate  #退出编辑
```

## virtualenvwrapper 常用命令

```
1.退出当前虚拟环境

$deactivate

2.列出虚拟环境列表

$lsvirtualenv -b

env1

env2

3.切换虚拟环境

$workon env2

4.进入当前虚拟环境

$cdvirtualenv

5.删除虚拟环境

$rmvirtualenv env1

6.进入当前环境的site-packages

$cdsitepackages

7.查看环境中安装了哪些包

$lssitepackages

8.复制虚拟环境

$cpvirtualenv env1 env3
```

