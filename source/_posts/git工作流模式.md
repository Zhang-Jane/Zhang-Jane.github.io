---
title: git工作流模式
abbrlink: 16146bf6
date: 2022-12-14 20:53:34
tags: git
categories: git
---
## 集中式工作流
开发者直接在本地 master 分支开发代码，开发完成后 push 到远端仓库 master 分支。
## 功能分支工作流
开发者基于 master 分支创建一个新分支，在新分支进行开发，开发完成后合并到远端仓库 master 分支。
## Git Flow 工作流
Git Flow 工作流为不同的分支分配一个明确的角色，并定义分支之间什么时候、如何进行交互，比较适合大型项目的开发。
## Forking 工作流
开发者先 fork 项目到个人仓库，在个人仓库完成开发后，提交 pull request 到目标远程仓库，远程仓库 review 后，合并 pull request 到 master 分支
## 例子（仅仅只是参考）
```bash
==分支开发==
1.git clone // 到本地

2.git checkout -b xxx 切换至新分支xxx
（相当于复制了remote的仓库到本地的xxx分支上)

3.修改或者添加本地代码（部署在硬盘的源文件上）

4.git diff 查看自己对代码做出的改变

5.git add 上传更新后的代码至暂存区

6.git commit 可以将暂存区里更新后的代码更新到本地git

7.git push origin xxx 将本地的xxxgit分支上传至github上的git
（如果在写自己的代码过程中发现远端GitHub上代码出现改变）

==分支的合并==

1.git checkout main 切换回main分支

2.git pull origin master(main) (或者git pull --rebase)将远端修改过的代码再更新到本地

3.git checkout xxx 回到xxx分支

4.git rebase main 我在xxx分支上，先把main移过来，然后根据我的commit来修改成新的内容，最终合并成一条线
（中途可能会出现，rebase conflict -----》 本地如果产生冲突，手动解决冲突之后，用"git add"命令去更新这些内容的索引(index)，然后只要执行:git rebase --continue 就可以线性的连接本地分支与远程分支，无误之后就回退出，回到分支上。）

5.git push -f origin xxx 把rebase后并且更新过的代码再push到远端github上
（-f ---》强行）

6.原项目主人采用pull request 中的 squash and merge 合并所有不同的commit

==远端完成更新后==

1.git branch -d xxx 删除本地的git分支

2.git pull origin master (或者git pull --rebase)再把远端的最新代码拉至本地

```

标注：
- git rebase 通常用于重写提交历史
- git pull的默认行为是git fetch + git merge
- git pull --rebase则是git fetch + git rebase
- git rebase --abort 会放弃合并，回到rebase操作之前的状态，之前的提交的不会丢弃；
- git rebase --skip 则会将引起冲突的commits丢弃掉（慎用！！）；
- git rebase --continue 合并冲突，结合"git add 文件"命令一起用与修复冲突，提示开发者，一步一步地有没有解决冲突。（fix conflicts and then run “git rebase --continue”）
- squash （Git squash 是一个 Git 命令，用于将多个提交合并为一个提交）
    -  git rebase -i HEAD~n（其中 n 是需要合并的提交数）
    - 会打开一个默认的编辑器，然后pick这个词替换成squash，然后wq保存既可，不懂里面有提示。
    - 保存之后，会打开一个新的文本编辑器窗口来确认提交，我们将在第一条提交消息的顶部添加新的提交消息。


详细查看：https://www.v2ex.com/t/770008