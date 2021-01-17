---
title: git笔记
tags: git
categories: git
abbrlink: d9283bc6
date: 2021-01-15 23:46:26
---
# 常用的git命令
- git update-index --skip-worktree
- git update-index --assume-unchanged 
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

## git add 的各种区别:
- git add -A   添加所有改动
- git add *     添加新建文件和修改，但是不包括删除
- git add .     添加新建文件和修改，但是不包括删除
- git add -u   添加修改和删除，但是不包括新建文件

## 代码回滚
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

## git忽略
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
