---
title: mac安装pyenv遇到的问题
tags: pyenv
abbrlink: 42c0375b
date: 2020-11-22 17:05:27
---
## 加速pyenv下载

将源码下好放在~/.pyenv/cache目录, pyenv检查有源码就会直接使用cache目录里的源码进行安装.

```bash
$ mkdir -pv ~/.pyenv/cache
$ wget https://www.python.org/ftp/python/<version>/Python-<version>.tar.xz
$ pyenv install <version>
```

```
wget https://www.python.org/ftp/python/3.7.5/Python-3.7.5.tar.xz
```

## pycahrm无法判断pyenv多个python版本

https://github.com/concordusapps/pyenv-implict

## mac无法安装python3解决方案

```bash
CFLAGS="-I$(brew --prefix openssl)/include -I$(brew --prefix bzip2)/include -I$(brew --prefix readline)/include -I$(xcrun --show-sdk-path)/usr/include" LDFLAGS="-L$(brew --prefix openssl)/lib -L$(brew --prefix readline)/lib -L$(brew --prefix zlib)/lib -L$(brew --prefix bzip2)/lib" pyenv install --patch 3.8.0 < <(curl -sSL [https://github.com/python/cpython/commit/8ea6353.patch\?full_index\=1)](https://github.com/python/cpython/commit/8ea6353.patch/?full_index\=1))
```

https://koji-kanao.medium.com/install-python-3-8-0-via-pyenv-on-bigsur-b4246987a548

