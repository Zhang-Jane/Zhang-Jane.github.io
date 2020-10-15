---
title: python的数据结构
tags: 数据结构
categories: 数据结构和算法
abbrlink: 2ff1809f
date: 2020-10-16 02:10:04
top_img:
cover:
---
## 列表

### 列表使用（常用的）

- `list.insert(index, obj)`将对象插入列表

- `list.pop([index=-1])`移除列表中的一个元素（默认最后一个元素），并且返回该元素的值

- `list.append(obj)`在列表末尾添加新的对象

- 列表的切片：

    ```python
        a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        """
        -10 -9 -8 -7 -6 -5 -4 -3 -2 -1
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
         0  1  2  3  4  5  6  7  8  9
        """
        a[1:3]  
        # 注意结果不是从1,3的元素，因为列表的下标是从0开始,最后一个索引的位置要-1。
        output:[2, 3]
        a[:3]  
        # [1, 2, 3]
        
        a[1:5:2]  
        # 当后面有步长的时候。
        output:[2, 4]
            
        a[-1:5]或者a[-1:-5] # 下标从左往右
        output:[]
        a[-1:5:-1]
        output:[10, 9, 8, 7]
        a[-1:-5:-1]
        output:[10, 9, 8, 7]

        # 1.不管是正索引还是负索引，在给范围的时候都会把最后的位置-1。2.step为负的时候，从右往左访问
    ```
- 列表的深浅拷贝

    ```python
        # 浅拷贝
        alist = [1, 2, 3, ["a","b"]]
        clist = copy.copy(alist)
        clist[1] = 5
        print(alist)
        print(clist)
        alist[3][0] = 1
        print(alist)
        print(clist)
        
        [1, 2, 3, ['a', 'b']]
        [1, 5, 3, ['a', 'b']]
        [1, 2, 3, [1, 'b']]
        [1, 5, 3, [1, 'b']]
        
        # 说明，c浅拷贝的a的对象引用，当c改变的时候不会改变a，当a改变的时候会影响c
    
        # 深拷贝
        alist = [1, 2, 3, ["a","b"]]
        clist = copy.deepcopy(alist)
        clist[1] = 5
        print(alist)
        print(clist)
        alist[3][0] = 1
        print(alist)
        print(clist)
        
        [1, 2, 3, ['a', 'b']]
        [1, 5, 3, ['a', 'b']]
        [1, 2, 3, [1, 'b']]
        [1, 5, 3, ['a', 'b']]
        
        # 赋值语句
        alist = [1, 2, 3, ["a","b"]]
        clist = alist
        clist[1] = 5
        print(alist)
        print(clist)
        alist[3][0] = 1
        print(alist)
        print(clist)
        
        [1, 5, 3, ['a', 'b']]
        [1, 5, 3, ['a', 'b']]
        [1, 5, 3, [1, 'b']]
        [1, 5, 3, [1, 'b']]
    ```

## 集合

- 可变的，无序的，不重复的。

- 定义用set（），不能{}。

- set里面元素必须可以hash，里面的元素不可以索引。

## 元祖

- 有序的元素的集合
- 元祖是不可变对象
- 元祖的定义(1,)，不能(1)
- 元祖不可变，只有读方法

## 字典

- 可变的，无序的

- key不重复且可hash

- 定义

- dict()

- dict(**kwargs)

- dict(二元结构)

- dict.fromkeys(iterable, values)

- dict.key() -> dict_keys(['a', 'b', 'c'])

- dict.items() - > dict_items([('a', 1), ('b', 4), ('c', 6)])

- 字典的keys()和items()返回的对象支持类似集合操作（交集，并集，差集）

- 字典的排序

    ```python
        a_dic = {'a':{'val':3}, 'b':{'val':4}, 'c':{'val':1}}
        b_dict = sorted(a_dic.items(), key=lambda d:d[1]['val'], reverse = True)

        a_dic = {'a':1, 'b':4, 'c':6}
        b_dict = sorted(zip(a_dic.keys(), a_dic.values()), reverse = True)
        print(b_dict)
        
        [('c', 6), ('b', 4), ('a', 1)]
        

        from operator import itemgetter
        b_dict = sorted(a_dic.items(), key=itemgetter(1), reverse=True)
        print(b_dict)
    ```

## 关于定义

    ```
    题目1：
    A: tuple: a = (1)
    B: set: b = {}
    C: dict: c = dict(a="b")
    D: dict: d = dict(a=(1, ))
    E: dict: e = dict(a=[1,2])

    变形题目2：
    A: dict: b = dict{(1,2):3}
    B: dict: c = dict(a=(1,2))
    C: dict: d = dict(a={1,2}
    D: dict: e = dict({1,2}:3)

    变形题目3：
    A: dict: c = dict(zip([1,2], (3,4)))
    B: dict: d = dict(([1,2], [3,4]))
    C: dict: a = dict((1, 2), (3,4))
    D: dict: e = dict.fromkeys([1,2,3,4], 1)

    变形题目4：
    A: dict: c = dict.fromkeys([1,2], (3,4)))
    B: dict: d = dict.fromkeys({1:2}, (3,4)))
    C: dict: a = dict.fromkeys("12", "34")
    D: dict: a = dict.fromkeys(1, "34")
    E: dict: e = dict.fromkeys([1,2,3,4], 1)
    ```

## 关于操作

    ```
    A: (1, 2) + (1, 2)
    B: (1, 2) + [1, 2]
    C: {1, 2} + {1, 2}
    D: [1, 2] + [[1,2], 2]
    ```

    ```
    A: a, b = 1, 2 => a = 1,b = 2
    B: *a, b = 1, 2 => a = (1, ), b = 2
    C: a = 1, 2 => a = (1, 2)
    D: a, *_ = 1, 2 => a = 1
    ```

    ```
    A: a = 1, 2, 3 => a = (1,2,3)
    B: a, *_, b = 1,2,3,4 => a = 1, _ = (2, 3), b = 4 
    C: *_, a, b = 1,2,3,4 => _ = [1, 2], a = 3, b= 4
    D: *_, a, b = (1,2,3,(4,5)) => _ = [1, 2], a = 3, b = (4, 5)
    ```


    ```
    A: *_, a, b = (1,2,3,(4,5),6,[7,8]) => _ = [1,2,3,(4,5)]
    B: *_, a, b = (1,2) => _ = [1]
    C: a, *_, b = 1,2,3 => _ = [2]
    D: a, b, *_ = 1,2,3 => _ = [3]
    ```


    ```
    A: a, b, [] = 1, 2, 3
    B: a, b, *[a] = 1, 2, 3
    C: a, b, **{"a":2} = 1, 2, 3
    D: a, b, c, x = 1, 2, 3, lambda x:x
    ```

## 计数器

    ```python
    from operator import itemgetter

    seq = ('Google', 'Runoob', 'Taobao', 'Taobao', 'Taobao', 'Google')
    key_map = dict.fromkeys(seq, 0)
    for i in seq:
        if i in key_map:
            key_map[i] = key_map[i] + 1
            
    # li = sorted(key_map.items(), key=itemgetter(1), reverse=True)
    li = sorted(key_map.items(), key=lambda item: item[1], reverse=True)[:3]
    print(li)
    ```

## 关于python的zip解包

    ```
    x = zip([1, 2, 3], [4, 5, 6])


    def a(x):
        print(*x)
    a(x)

    (1, 4) (2, 5) (3, 6)
    ```

