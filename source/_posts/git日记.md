---
title: git笔记
tags: git
categories: git
abbrlink: d9283bc6
date: 2021-01-15 23:46:26
---
# 常用的git命令
- git update-index --skip-worktree
- git branch -u origin/branch 建立当前分支与远程分支的映射关系
- git update-index --assume-unchanged 
- git log --all --since "2021-03-01" --oneline --author="Zhang-Jane"
- git remote update origin —prune 更新远程分支本地列表
- git branch -vv 查看分支映射
- git push origin --delete <BranchName> 删除远程分支
- git rev-list —all | xargs git grep -F 关键词
- git ls-files 查看哪些文件在版本控制下
- git clone -b 远程分支名  仓库地址
- git blame 查找文件修改者
- git log --oneline
- git restore
    - 对于git restore <file>命令，会撤销文件的修改，使文件恢复到暂存区或本地代码库（取决于文件在修改前的状态）；
    - 对于git restore --staged <file>命令，把文件从暂存区撤回到工作区，保留文件最后一次修改的内容；
- git log --all --grep='fix'
- git log --author="Maxence"
- git reflog
- git rm file_path && git rm --cached file_path
- git diff master..my-branch 查看分支之间的不同
- git reset <file> 撤销单个文件的add
- git stash apply 应用某个存储,但不会把存储从存储列表中删除，默认使用第一个存储,即stash@{0}，如果要使用其他个，git stash apply stash@{$num} ， 比如第二个：git stash apply stash@{1} 
- git commit --amend -m "更好的提交日志" 编辑上次提交

# git add 的各种区别:

- git add -A   添加所有改动
- git add *     添加新建文件和修改，但是不包括删除
- git add .     添加新建文件和修改，但是不包括删除
- git add -u   添加修改和删除，但是不包括新建文件

# 代码回滚

工作区 -> 暂存区（stage） -> 版本库
git checkout -- readme.txt 撤销

```
# HEAD是当前版本
# HEAD^是上一个版本
# HEAD^^是上上个版本
# HEAD~100是前100个版本

# 回到上一个版本
git reset --hard HEAD^ 

# 若本地不小心修改或删除了很多文件，一个一个恢复太麻烦，可以这样，回到上一个版本 git reset --hard HEAD
```

- 拉取远程分支并合并到指定分支
    - git pull origin <远程分支名>:<本地分支名>
- 本地分支重命名(还没有推送到远程)
    - git branch -m oldName newName
- 远程分支重命名 (已经推送远程-假设本地分支和远程对应分支名称相同)
 - 重命名远程分支对应的本地分支
    - git branch -m oldName newName
- 删除远程分支
    -  git push --delete origin oldName
- 上传新命名的本地分支
    - git push origin newName

### git checkout和reset的区别
git checkout -- file；撤销对工作区修改；这个命令是以最新的存储时间节点（add和commit）为参照，覆盖工作区对应文件file；这个命令改变的是工作区

git reset HEAD -- file；清空add命令向暂存区提交的关于file文件的修改（Ustage）；这个命令仅改变暂存区，并不改变工作区，这意味着在无任何其他操作的情况下，工作区中的实际文件同该命令运行之前无任何变化

# git忽略

### .gitignore

只要在.gitignore 里面加入你自己的文件，那么 git 就会忽略这些文件，不去追踪,可以说说大部分人的解决方案。

### .git/info/exclude

修改.gitignore 会告诉别人你忽略了哪些文件。 这个排除设置都是是保存在本地，所以排除信息不会共享到远程仓库 ，适用于一些不想跟别人分享的忽视。

*注意：以上方法都只适用未被 git 追踪的文件，一但被 git 追踪就没用了，但是接下来就有请下两个方法*

### git update-index --assume-unchanged

设计用于检查一组文件是否已被修改的开销很大的情况；当您设置该位时，git（当然）假定与索引的该部分相对应的文件尚未在工作副本中被修改。这样可以避免一团糟stat。只要索引中的文件条目发生更改（因此，当文件在上游更改时），该位就会丢失。

如果有需要提交的改动 可以用 git update-index --no-assume-unchanged <file> 来撤销申明。

使用git update-index --assume-unchanged config.log 忽略文件
然后切换分支 ，提示有文件没提交。
使用commit做版本提示没有文件要做版本。

解决方案：
执行命令 git update-index --no-assume-unchanged config.log 恢复文件跟踪即可解决

### git update-index --skip-worktree

比 assume-unchanged 的方式 更进一步 是 skip-worktree，适用于 希望某些配置文件不会随着 git 更新而发生变化的时候用

即使 git 知道文件已经被修改(或者需要通过 reset 进行修改—— hard 或类似的方式) ，它也会假装没有被修改，而是使用索引中的版本。这种情况一直持续到索引被丢弃。

区别是 assume-unchanged 是告诉 git 你没改过，所以检出分支，git 会把对应更新还原到分支的状态。

# git 恢复误删的远程分支

查看reflog，找到最后一次commitid
git reflog --date=iso
reflog是reference log的意思，也就是引用log，记录HEAD在各个分支上的移动轨迹。选项 --date=iso，表示以标准时间格式展示。这里你肯定会问，为什么不用git log？git log是用来记录当前分支的commit log，分支都删除了，找不到commit log了。
找到目标分支最后一次的commitid

切出分支

```
git checkout -b recovery_branch_name commitid
```

切出分支后，本地有分支了，再push到远程仓库就可以了

```
git push  origin recovery_branch_name 
```

# 修改commit信息

```
//执行的命令
git log //查看提交日志，找到要修改的commit
git rebase -i HEAD~1 //切到需要修改的commit中
//按 i 进入编辑模式，修改pick 为 edit 然后  :wq 保存退出
git commit --amend  //修该commit信息
// 按 i 进入编辑模式，修改需要的内容然后  :wq 保存退出
git rebase --continue  //退出修改，继续之后的git操作
git push //推送到服务器
```



# git提交的message规范

## 提交格式：

<type>(<scope>):   <subject>

## type

- feat：新功能（feature）,⼀般是新写的代码
- fix：修补bug
- perf: 提升性能
- docs：⽂档（documentation）
- style： 格式，修改了空格、格式缩进、逗号等等，格式化等不影响代码运⾏的变动
- refactor：重构，即不是新增功能，也不是修改bug的代码变动
- test：增加测试代码
- chore：构建过程或辅助⼯具的变动或改变构建流程、或者增加依赖库、⼯具等
- revert: 回滚到上⼀个版本

<scope>
范围可以是指定提交更改位置的任何内容，如：
\- 对 package.json 文件新增依赖库，chore(package.json): 新增依赖库
\- 或对代码进行重构，refacto(weChat.vue): 重构微信进件

<subject>
如果没有更合适的范围，可以直接写提交内容

示例：feat(user):  add user list interface  

type，scope，subject都是要有的，不能为空

## subject 简短描述

以动词开头，使⽤第⼀⼈称现在时，⽐如change，⽽不是changed或changes

第⼀个字⺟⼩写

结尾不加标点符号

commit subject 应该清晰明了，说明本次提交的⽬的

不超过50个字符

subject前⾯有个空格

