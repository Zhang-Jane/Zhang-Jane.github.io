---
title: python3类型注释
abbrlink: f19d1117
date: 2021-04-20 17:54:18
tags: python3
categories: python3
---

### 普通的注释

- 在声明变量类型时，变量后方紧跟一个冒号，冒号后面跟一个空格，再跟上变量的类型。

- 在声明方法返回值的时候，箭头左边是方法定义，箭头右边是返回值的类型，箭头左右两边都要留有空格

    ```python
    name: str = "jack"
    def greeting(name: str) -> str:
        return 'Hello ' + name
    ```

### typing模块的使用

List 列表，是 list 的泛型

Tuple 元组，是 tuple 的泛型

Dict 字典，是 dict 的泛型

Set 集合，是 set 的泛型

Sequence:

Sequence，是 collections.abc.Sequence 的泛型，在某些情况下，我们可能并不需要严格区分一个变量或参数到底是列表 list 类型还是元组 tuple 类型，我们可以使用一个更为泛化的类型，叫做 Sequence

泛型(Generic):

由于无法以通用方式静态推断有关保存在容器中的对象的类型信息，因此抽象基类已扩展为支持订阅以表示容器元素的预期类型。

```python
	
from typing import List, Tuple
	
var: List[int or float] = [2, 3.5]

def size(rect: Mapping[str, int]) -> Dict[str, int]:
    return {'width': rect['width'] + 100, 'height': rect['width'] + 100}
```



### 类型别名

```python
from typing import List
Vector = List[float]

def scale(scalar: float, vector: Vector) -> Vector:
    return [scalar * num for num in vector]

# typechecks; a list of floats qualifies as a Vector.
new_vector = scale(2.0, [1.0, -4.2, 5.4])
```

### 用户定义的泛型类型

```python
from typing import TypeVar, Generic
from logging import Logger

T = TypeVar('T')

class LoggedVar(Generic[T]):
    def __init__(self, value: T, name: str, logger: Logger) -> None:
        self.name = name
        self.logger = logger
        self.value = value

    def set(self, new: T) -> None:
        self.log('Set ' + repr(self.value))
        self.value = new

    def get(self) -> T:
        self.log('Get ' + repr(self.value))
        return self.value

    def log(self, message: str) -> None:
        self.logger.info('%s: %s', self.name, message
```



### Any

Any，是一种特殊的类型，它可以代表所有类型，静态类型检查器的所有类型都与 Any 类型兼容，所有的无参数类型注解和返回类型注解的都会默认使用 Any 类型

### NewType

NewType，我们可以借助于它来声明一些具有特殊含义的类型，例如像 Tuple 的例子一样，我们需要将它表示为 Person，即一个人的含义，但但从表面上声明为 Tuple 并不直观，所以我们可以使用 NewType 为其声明一个类型.

```python
Person = NewType('Person', Tuple[str, int, float])
person = Person(('Mike', 22, 1.75))
1
2
Person = NewType('Person', Tuple[str, int, float])
person = Person(('Mike', 22, 1.75))
```

### Union

Union，联合类型，`Union[X, Y]` 代表要么是 X 类型，要么是 Y 类型

```python
def process(fn: Union[str, Callable]):
    if isinstance(fn, str):
        # str2fn and process
        pass
    elif isinstance(fn, Callable):
        fn()
```

### Callable

期望特定签名的回调函数的框架可以将类型标注为 `Callable[[Arg1Type, Arg2Type], ReturnType]`

```python
from typing import Callable

def feeder(get_next_item: Callable[[], str]) -> None:
    # Body

def async_query(on_success: Callable[[int], None],
                on_error: Callable[[int, Exception], None]) -> None:
    # Body
```

### Typing.Optional类

可选类型，**作用几乎和带默认值的参数等价**，不同的是使用Optional会告诉你的IDE或者框架：这个参数除了给定的默认值外还可以是None，而且使用有些静态检查工具如mypy时，对 a: int =None这样类似的声明可能会提示报错，但使用a :Optional[int] = None不会。

