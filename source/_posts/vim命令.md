---
title: vim命令
tags: vim
abbrlink: 7de3426c
date: 2022-12-16 22:16:05
---
## help
**:h {TEXT}**
```bash
:h motion  # 第一章我们讲过了motion，可以试着自己看看
:h buffer  # buffer是vim处理文件缓存的方式
:h tab     # tab和浏览器、vscode的tab一样
:h window  # 窗口的概念 和窗口相关的是split，窗口分割
:h         # 当然可以打开整个帮助手册
:h z       # z命令帮助
```

## 基础
1.转到文件结尾
G 
2.或转到第9行
9G 
3.删除所有内容(先用G转到文件尾) ，使用`:`
:1,.d 
或者删除第9行到第200行的内容(先用200G转到第200行) ，使用
:9,.d
4.删除光标所在处字符
x
5.删除光标所在前字符（大写 X ）
X
6.删除到下一个单词开头
dw
7.删除到本单词末尾
de
8.删除到本单词末尾包括标点在内
dE
9.删除到前一个单词
db
10.删除到前一个单词包括标点在内
dB
11.删除一整行
dd
12.删除光标位置到本行结尾
D d$
13.删除光标位置到本行开头
d0
说明：这是在vim中 ，“.”当前行 ，“1,.”表示从第一行到当前行 ，“d”删除，3dd代表删除三行。
J
将光标所在的行与下一行的数据结合成一行
`.`
重复上一次的操作
9b 光标向前移动9个单词 
`8<C-d>` 翻页操作8次
:w     保存文件 字面意思 write
:w!    强制保存文件
:wa    保存所有文件，针对你打开buffer过多的情况
:q     退出
:q!    强行退出
:wq    保存并退出
:qa    退出所有buffer 
### 多文本编辑
`:n`
编辑下一个文件
`:N`
编辑上一个文件
`:files`
列出当前这个vim打开的所有文件
### 多窗口
:sp [filname]	打开一个新的窗口，如果没有filename，会默认打开一个当前文本的窗口，同步显示。有则会同时显示fileame和origin两个文本。
:new+窗口名(保存后就是文件名)
:vsplit+窗口名，也可以简写为：vsp+窗口名，
Ctrl + w + h：向左移动窗口
Ctrl + w + j： 向下移动窗口
Ctrl + w + j： 向上移动窗口
Ctrl + w + l： 向右移动窗口
:tabc 关闭当前窗口
:tabo 关闭所有窗口
### 字符移动

```
k            上移                k
h            左移            h        l
l            右移                j
j            下移
```

你也可以使用键盘上的方向键来移动，但这么做h j k l的存在就失去了意义

之所以使用h j k l来控制方向，其主要目的是让你的手不离开键盘中心，从而提高效率

**tips**：在命令前加上数字代表命令执行次数，如：5k，表示上移5行

 #### 单词移动

```
W w            移动到下一个单词开头
E e            移动到下一个单词结尾
B b            倒退到上一个单词开头
```

需要注意的是，E会忽略标点符号，如：I‘m，e会当成两个单词，E则不会
同样，在命令前加上数字代表执行次数，如：2w，表示往下移动2个单词

#### 整行移动

```
0            移动到行首
$            移动到行末
+            移动到下一行开头
-            移动到上一行开头
```

这里需要注意的是+ -和上面的j k有什么不同之处
j k也是移动到上一行和下一行，但它们移动的是光标所在的位置
\+ -不管你的光标在何处，总是移动到下一行或上一行的行首

**滚屏**

```
Ctrl+f            往前滚动一整屏
Ctrl+b            往后滚动一整屏
Ctrl+d            往前滚动半屏
Ctrl+u            往后滚动半屏

Ctrl+e            往后滚动一行        
Ctrl+y            往前滚动一行
```

看似比较多，但是可以根据键盘的位置来进行记忆，并且下面两个也不常用

上面的滚屏都有一个共同点，就是会改变光标的位置，且屏幕也在改变

如果想让光标维持在原来的位置实现滚屏请看下面

**用z调整光标**

```
z<Enter>        将光标所在行移动到屏幕顶端
z.              将光标所在行移动到屏幕中间
z-              将光标所在行移动到屏幕低端
```

`tips：980z<Enter>可以将第980行移动到屏幕顶端`

好吧，有时候你其实不想滚屏，你只想在当前屏幕中移动

请往下看

**在屏幕中移动**
H            移动到屏幕顶端的行
M            移动到屏幕中央的行
L            移动到屏幕底端的行
nH           移动到屏幕顶端往下的第n行
nL           移动到屏幕顶端往上的第n行

据我猜测这三个字母应该是HIgh、Middle和Low的缩写，其实挺好记的
多练习几遍就行了，需要注意的是：这里只是光标的位置变化，和上面两种不同
tips：你可以用+ -和j k实现同样的位置变化，只不过要操作多次而已

**在当前行移动**
^            移动到当前行的第一个非空格处
n|           移动到当前行的第n列

这里的^与上面的0通常情况下表示的位置是一样的
而n|，个人感觉还没有h l方便，慢慢的数出行数还不如直接按着h l 左右移

**根据文本块移动**

所谓的文本块也就是句子、段落、小节等

```
（            移动到当前句子开头
）            移动到下一个句子开头
{            移动到当前这一段开头   
}            移动到下一段开头
[[           移动到当前这一节的开头
]]           移动到下一节的开头
```
其中，VIM以? . !等符号来标记一个句子
空白行来标记一个段落
用节宏来标记一个节（节宏是什么我还没搞清楚）

根据行号来移动
Ctrl+g            显示当前行信息
nG                转至第n行
G                 转至文本末尾
gg　　　移至文本开头

如果你不知道当前是多少行的话就可以用Ctrl+g来查看
如果想转到第800行，可以用800G
其实z命令也可以做到，并且把光标移动到第一行
## 剪切板和寄存器
### 无名寄存器("")
两个双引号，Vim中叫做无名寄存器。x,s,d,c,y等操作，如果不指定寄存器，都是将临时内容放到这个寄存器中，也就是相当于一个默认寄存器。  
可以通过 <font color="#ff0000">:reg </font>来查看当前寄存器的值，操作一下，然后查寄存器内容，就明白了。  
例如：  
复制当前行(yy)，并粘贴p。  
这里y命令会将当前行内容放入寄存器""，按p时，会到寄存器""中取内容。

### 复制专用寄存器("0)

通过y命令复制的内容，会保存到寄存器0中。  
寄存器的使用是通过"后面跟寄存器名字。  
例如：  
复制当前行(yy)，  
又做了几次删除单词操作(dw)  
但是只想粘贴刚才复制的行，那么就不能用无名寄存器""去粘贴了，不能直接p进行粘贴，需要用"0p，指定使用寄存器0，因为"0里只存放y命令存入的内容。

### 删除专用寄存器("1-"9)

通过d或c命令，删掉的内容，会保存打"1-"9这9个寄存器中。  
最新删除的内容，会在"1中，其他顺延。  
例如：  
删除当前行(yy)  
删除当前行(yy)  
想复制第一次删除的行，"2p

### 命名寄存器("a-"z)

可以将重要内容放到命名寄存器"a-"z中，一共26个。  
例如：  
把当前行放入寄存器"j里，"jyy  
复制寄存器"j的内容， "jp

### 黑洞寄存器("d)

放到这个寄存器的内容，将不会放到任何其他寄存器中，相当于彻底删除内容。  
例如：  
彻底删除当前行，不放入任何寄存器，"dd

### 系统剪贴板("+)

通过"+寄存器可以把内容复制到系统剪贴板，也可以从系统剪贴板粘贴内容但Vim中。  
例如：  
复制当前行到系统剪贴板中，"+yy  
复制系统剪贴板到vim中，"+p

## 高阶
### 各种操作的含义
```bash
c       change 修改
d       delete 删除
y       yank   复制到寄存器
p        put  粘贴
<       块移动，左移动
>       块移动，右移动
```
### 命令行结果输出到buffer
`enew|pu=execute('命令')`
- pu  is put the text from register after line(default curent line)

### vim text object
```cmd
[number]<command>[text object or motion]
```
其中：**number**是指命令作用在几个文本对象之上。比如3个单词；**command**是指执行的具体命令。比如删除或复制；**text object or motion**是指具体的文本对象。比如单词、句子或段落。

### 文本对象的类型

-   iw …inner word(**不**包括周围的空格)
-   aw …a word(含在周围的空格)
-   iW …inner WORD(字串（以空格分隔）)
-   aW …a WORD
-   is …inner sentence
-   as …a sentence
-   ip …inner paragraph
-   ap …a paragraph
-   it …inner tag
-   at …a tag
-   i( or i) …inner block
-   a( or a) …a block
-   i< or i> …inner block
-   a< or a> …a block
-   i{ or i} …inner block
-   a{ or a} …a block
-   i[ or i] …inner block
-   a[ or a] …a block
-   i" …inner block
-   a" …a block
-   i` …inner block
-   a` …a blocko
复制
-   `yy` 或 `Y` 复制当前行。
-   `yw` 用来复制往后一个词，`y3w` 复制往后三个词。
-   `yiw` 复制当前词。
-   `y$` 复制到行尾，`y^` 复制到行首。
-   `yf.` 复制直到下一个 `.` 字符。
-   `ggyG` 或 `:%y` 复制整个文件。

修改
```bash
diw     delete in word     删除一个单词
di"     delete in "        删除"word"中的word
daw     delete around word 删除一个单词和包裹
cb      change back        向前删除到单词头部，并进入插入模式，即修改
cis     change in sentence 修改句子
ci<     change in <        修改<word>中的word
ca<     change around <    修改<word>
```


### surround.vim
ys(add)
ds(delete)
cs(change)
It's easiest to explain with examples. Press `cs"'` inside

```
"Hello world!"
```

to change it to

```
'Hello world!'
```

Now press `cs'<q>` to change it to

```
<q>Hello world!</q>
```

To go full circle, press `cst"` to get

```
"Hello world!"
```

To remove the delimiters entirely, press `ds"`.

```
Hello world!
```

Now with the cursor on "Hello", press `ysiw]` (`iw` is a text object).

```
[Hello] world!
```

Let's make that braces and add some space (use `}` instead of `{` for no space): `cs]{`

```
{ Hello } world!
```

Now wrap the entire line in parentheses with `yssb` or `yss)`.

```
({ Hello } world!)
```

Revert to the original text: `ds{ds)`

```
Hello world!
```

Emphasize hello: `ysiw<em>`

```
<em>Hello</em> world!
```
### 标签和跳转
mark: 
m + [0-9 a-z A-Z]
`跳转标记的字符，'跳转标记的行
jump:
ctrl  + O
ctrl  + I
hop:
```lua
vim.api.nvim_set_keymap('n', '<leader><leader>w', '<cmd>HopWord<cr>', {})
vim.api.nvim_set_keymap('n', '<leader><leader>j', '<cmd>HopLine<cr>', {})
vim.api.nvim_set_keymap('n', '<leader><leader>k', '<cmd>HopLine<cr>', {})
vim.api.nvim_set_keymap('n', '<leader><leader>s', '<cmd>HopChar1<cr>', {})
```

## 替换
替换
语法

:[range] s/{old-pattern}/{new-pattern}/[flags]
1
range确定范围，不写默认为当前行。
%         # 表示整个文件内容
.         # 表示当前行
$         # 表示最后一行
m,n       # 表示从第m行到第n行
,n        # 表示从当前行到第n行
n,        # 表示从第n行到当前行
n         # 指定行
+n        # 表示当前行之后的n行

old-pattern为要被替换的字符串，new-pattern为替换后的新字符串。替换操作与搜索操作使用同样的模式串系统。

flags为替换标志位，默认为指定范围内的行的第一次匹配的位置，帮助文档:h s_flags，常用标志如下：

g：global，表示在指定范围内执行全局操作,替换所有匹配项
c：confirm，可以确认或拒绝修改
n：number，报告匹配到的次数，不替换，可用来查询匹配次数
i:执行不区分大小写的替换
I:执行区分大小写的替换
e:防止替换失败时显示错误消息

```
:%s/^/#/g # 行前插入 `#` 替换或者gg<Ctrl-v>I#<Esc>
```

## 宏录制
```bash
录制语法 q{register}{commands}q
q - 开始录制
{register} - 表示寄存器名称 (a-z)
{commands} - 一组操作命令(一系列的键盘按键)
q - 是停止录制, 最后把 {commands} 以文本形式存到前面的寄存器里中

宏执行
语法 `@{register}`
`@@` 可以重复最近一次的 `@{0-9a-z":*}` 命令
```