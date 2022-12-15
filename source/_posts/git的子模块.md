---
title: git的子模块
abbrlink: 6060373f
date: 2022-12-14 19:31:03
tags: git
categories: git
---

# git submodule
https://git-scm.com/book/en/v2/Git-Tools-Submodules

**为什么要用submodules？**
经常发生的情况是，在处理一个项目时，您需要使用其中的另一个项目。也许它是第三方开发的库，或者您正在单独开发并在多个父项目中使用。这些场景中出现了一个常见问题：您希望能够将这两个项目视为独立的项目，但仍然能够在另一个项目中使用一个项目。


```bash
$ mkdir test
$ cd test
$ git init
$ git submodule add https://github.com/my-user/my-submodule.git <指定目录>
```

加上 --recursive 拉取嵌套的子模块（子模块本身又有子模块）

`git submodule update --init --recursive`

在clone时加上 --recurse-submodules选项自动拉取子模块

`git clone --recurse-submodules <main-project-repo-url>`


`git submodule update --remote [submodule-path] `(不用切目录进行手动更新)

`git submodule foreach git pull `遍历更新所有子库

删除子版本库
- `git rm --cache mymodule`
- 将submodule从工作区中删除
- 最后将.gitmodules目录删除

**注意：**
- 当产生内容变化，在主模块目录输入git status会显示子模块目录有更改，不会显示具体的内容，而且主目录无法对submodule操作

- 主模块在git add文件时是不会添加子模块目录下的内容，而是直接add子模块目录

- 当我们在主目录拉取代码的时候，子模块默认不会被拉取
- 主目录和子模块并不是完全没有关联，他们之间的变动都会在各自的status中显示

# git subtree

`git remote add subtree-origin git@github.com:xxxx/git_subtree_child.git`
`git remote show`
` git subtree add --prefix=subtree subtree-origin master --squash` #其中的--prefix=subtree可以写成：--p subtree 或 --prefix subtree
 该命令表示将远程地址为subtree-origin的，子版本库上master分支的，文件克隆到subtree目录下

--squash是可选参数，它的含义是合并，压缩的意思。

如果不增加这个参数，则会把远程的子库中指定的分支（这里是master）中的提交一个一个地拉取到本地再去创建一个合并提交；
如果增加了这个参数，会将远程子库指定分支上的多次提交合并压缩成一次提交再拉取到本地，这样拉取到本地的，远程子库中的，指定分支上的，历史提交记录就没有了。

父库中通过如下指令更新依赖的子库内容：

`git subtree pull --prefix=subtree subtree-origin master --squash`

# 区别
1. git subtree把子仓库当作整个仓库的一个子目录来处理，而git submodule则把子仓库作为一个独立的仓库来处理。
2. 当使用git subtree时，子仓库的所有文件都会被添加到父仓库中，并且可以像普通文件一样被管理和维护。相反，使用git submodule时，子仓库只会在父仓库中以一个特殊的条目出现，并且必须单独管理和维护。
3. git subtree允许把子仓库的内容合并到父仓库中，并且可以在父仓库中直接对子仓库的内容进行修改和提交，而git submodule则不允许这样做。相反，git submodule只能在父仓库中记录子仓库的提交历史，并且必须在子仓库中进行更改并提交。这意味着，使用git subtree可以更方便地管理父仓库和子仓库之间的关系，并且可以更灵活地组织和维护代码。

# 查缺补漏
因为submodule的特性，在push主模块的时候，子模块默认不会推送所以：

- 如果想要在 push 主仓库时同时推送子仓库，你可以使用 `git push --recurse-submodules=on-demand` 选项，如果有任意一个子模块有更新，就会 push 到远程仓库。
- 如果你想要强制 push 所有的子仓库，不管它们是否有更新，那么可以使用` git push --recurse-submodules=on-demand --force` 选项

注意：
主模块和子模块在同一个git目录下面管理，如果不在一个目录会出现俩个不同git，而且新的.git目录再管理另外一个submodule
```bash
--recurse-submodules[=<pathspec>]
                        initialize submodules in the clone
--recursive[=<pathspec>]
                        alias of --recurse-submodules
```