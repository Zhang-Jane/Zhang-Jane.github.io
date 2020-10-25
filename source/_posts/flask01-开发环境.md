---
title: flask的开发环境
tags: flask
abbrlink: 20d1e394
date: 2020-10-17 20:00:31
categories: flask
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

## pyenv(pyenv 不支持 Windows 系统)

pyenv lets you easily switch between multiple versions of Python. It's simple, unobtrusive, and follows the UNIX tradition of single-purpose tools that do one thing well.

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



