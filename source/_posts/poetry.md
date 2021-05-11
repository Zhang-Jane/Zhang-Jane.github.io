---
title: poetry
date: 2021-05-11 17:37:44
tags: python开发环境
---

# [poetry](https://python-poetry.org/)

常用命令

**init**

用于初始化项目，在项目目录下生成pyproject.toml文件，需要注意：执行这个命令时，会要求你输入pyproject.toml配置文件中的常用选项。

```
$ poetry init
```

**install**

上面也提到过，主要用来安装配置的依赖包，同时将依赖包信息写到poetry.lock文件中(首次)。

```
$ poetry install
```

**update**

上面提到过，主要用于获取最新版本的依赖，同时更新poetry.lock文件

```
$ poetry update
```

**add**

主要用于将依赖包添加到pyproject.toml文件中，同时会安装它们。

```
$ poetry add requests pendulum
```

**remove**

主要用于删除已经安装的依赖包。

```
$ poetry remove pendulum
```

### show

主要用于列出可用的依赖包，show后面可以加上依赖包的名称，显示更详细的内容。

```
$ poetry show (requests)
```

### run

主要用来执行python命令，会将run之后的命令放到python环境执行。

```
$ poetry run python -V
```

### build

主要用来将python文件打包，打包之后的产物有两种包的格式：sdist是源码格式；wheel是编译之后的格式。

```
$ poetry build
```

**publish**

主要用来将用build命令打包完成的产物上传到PyPI上。

用于配置正确的账号和用户名，这样才可以正常上传

```
$ poetry config http-basic.pypi username password
$ poetry publish
```

假如你们公司有自己的私有仓库，则可以通过如下方式上传：
先配置私有仓库的信息，然后再上传

```
$ poetry config repositories.foo https://foo.bar/simple/
$ poetry config http-basic.foo username password
$ poetry publish -r my-repository
```

运行Python脚本

```
poetry run python app.py
```

## 操作步骤

1. ```shell
   # 进入项目目录进行初始化，生成pyproject.toml文件
   
   cd pre-existing-project
   poetry init
   
   接下来会有一些设置选择，可看到有很多提示输入，不确定的内容就先按下Enter使用默认值，后续可以再修改pyproject.toml文件。
   This command will guide you through creating your pyproject.toml config.
   
   问题1:Package name [autotools]: 
   
   问题2:Version [0.1.0]:
   
   问题3:Description []: 
   
   问题4:Author [Zhang-Jane <xxx@xx.com>, n to skip]:
   
   问题5:License []: 
   
   问题6:Compatible Python versions [^3.7]:
   
   问题7:Would you like to define your main dependencies interactively? (yes/no) [yes] 
   
   问题8:Would you like to define your development dependencies interactively? (yes/no)
   
   问题9:Do you confirm generation? (yes/no) [yes]
   
   生成文件pyproject.toml
   
   [tool.poetry]
   name = "demo"
   version = "0.1.0"
   description = ""
   authors = ["Zhang-Jane <xx@xx.com>"]
   
   [tool.poetry.dependencies]
   python = "^3.7"
   
   [tool.poetry.dev-dependencies]
   
   [build-system]
   requires = ["poetry-core>=1.0.0"]
   build-backend = "poetry.core.masonry.api"
   
   ```

2. ```shell
   # 创建初始化python环境
   $ poetry config --list
   
   cache-dir = "/Users/janezhang/Library/Caches/pypoetry"
   experimental.new-installer = true
   installer.parallel = true
   virtualenvs.create = true
   virtualenvs.in-project = null
   virtualenvs.path = "{cache-dir}/virtualenvs"  # /Users/janezhang/Library/Caches/pypoetry/virtualenvs
   virtualenvs.create=true 自动创建
    
    
   $ poetry env info --path 查看创建的虚拟环境所在位置
   
   $ poetry install(会自动检测环境并安装)
   
   Creating virtualenv autotools-WalQ0nly-py3.7 in /Users/janezhang/Library/Caches/pypoetry/virtualenvs
   Updating dependencies
   Resolving dependencies... (0.1s)
   
   Writing lock file
   
   $ poetry env list
   
   autotools-WalQ0nly-py3.7 (Activated)
   
   虚拟环境的文件名称会以你的在init的时候命名的Package name包为开头，结尾就是python的版本号
   
   ```
   
3.  ```shell
    $ poetry env use python3 # 使用这个命令后，会在虚拟环境路径下创建一个envs.toml文件，用来存储哪些虚拟环境指定了Python解释器的版本
      Using virtualenv: /Users/janezhang/Library/Caches/pypoetry/virtualenvs/autotools-WalQ0nly-py3.

4. ```shell
   激活虚拟环境
   执行poetry的命令并不需要激活虚拟环境，因为poetry会自动检测当前虚拟环境，如果想在当前目录对应的虚拟环境中执行命令，可以使用以下命令：
   
   poetry run <你的命令> # 例如： poetry run python flask.py
   如果想显示的激活虚拟环境，使用如下命令：
   
   $ poetry shell
   Spawning shell within ˝˝©/autotools-WalQ0nly-py3.7
   janezhang@bogon AutoTools % . /Users/janezhang/Library/Caches/pypoetry/virtualenvs/autotools-WalQ0nly-py3.7/bin/activate
   (autotools-WalQ0nly-py3.7) janezhang@bogon AutoTools % 
   ```
   
5. ```shell
   版本限制：https://python-poetry.org/docs/dependency-specification/
   
   在项目根目录文件pyproject.toml末尾加入下述其一：
   
   阿里云：
   
   [[tool.poetry.source]]
   name = "aliyun"
   url = "https://mirrors.aliyun.com/pypi/simple/"
   豆瓣：
   
   [[tool.poetry.source]]
   name = "douban"
   url = "https://pypi.doubanio.com/simple/"
   网易：
   
   [[tool.poetry.source]]
   name = "163"
   url = "https://mirrors.163.com/pypi/simple/"
   清华大学：
   
   [[tool.poetry.source]]
   name = "tsinghua"
   url = "https://pypi.tuna.tsinghua.edu.cn/simple/"
   default = true
   
   ```
6. 安装依赖
   ```
   poetry add flask ：安装最新稳定版本的flask
   
   poetry add pytest --dev : 指定为开发依赖，会写到pyproject.toml中的[tool.poetry.dev-dependencies]区域
   
   poetry add flask=2.22.0 : 指定具体的版本
   
   poetry install : 安装pyproject.toml文件中的全部依赖
   
   poetry install --no-dev ： 只安装非development环境的依赖，一般部署时使用
   
   poetry show ：查看项目安装的依赖
   
   poetry show -t ：树形结构查看项目安装的依赖
   
   poetry update：更新所有锁定版本的依赖
   
   poetry update httprunner ：更新指定的依赖
   
   poetry remove ： 卸载依赖
   ```
   
7. 部署环境

   ```
   1. poetry install --no-dev
   2. poetry run python xxx 或者 poetry shell中执行
   ```

   