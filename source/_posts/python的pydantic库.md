---
title: python的pydantic库
abbrlink: c9e744c1
date: 2021-04-21 16:54:45
tags:
---

# 官方文档以及定义
https://pydantic-docs.helpmanual.io/

Data validation and settings management using python type annotations.

使用 python 类型注释进行数据验证和设置管理。

pydantic enforces type hints at runtime, and provides user friendly errors when data is invalid.

Pydantic 在运行时强制类型提示，并在数据无效时提供用户友好的错误。

Define how data should be in pure, canonical python; validate it with pydantic.

定义纯粹的、规范的 python 中的数据应该是什么样的; 使用 pydantic 验证它。

## 基本的类型
```python
from pydantic import BaseModel
from typing import Dict, List, Sequence, Set, Tuple

class Demo(BaseModel):
    a: int # 整型
    b: float # 浮点型
    c: str # 字符串
    d: bool # 布尔型
    e: List[int] # 整型列表
    f: Dict[str, int] # 字典型，key为str，value为int
    g: Set[int] # 集合
    h: Tuple[str, int] # 元组

# 枚举类型
from enum import Enum

class Gender(str, Enum):
    man = "man"
    women = "women"

# 可选数据类型 
from typing import Optional
from pydantic import BaseModel

class Person(BaseModel):
    name: str
    age: Optional[int]

# 多种数据类型
from typing import Union
from pydantic import BaseModel

class Time(BaseModel):
    time: Union[int, str]
```
更多参考：https://pydantic-docs.helpmanual.io/usage/types/****

# validator
```python
class Password(BaseModel):
    password: str

    @validator("password")
    def password_rule(cls, password):
        def is_valid(password):
            if len(password) < 6 or len(password) > 20:
                return False
            if not re.search("[a-z]", password):
                return False
            if not re.search("[A-Z]", password):
                return False
            if not re.search("\d", password):
                return False
            return True

        if not is_valid(password):
            raise ValueError("password is invalid")

pw = Password(password="111222")
```

更多参考：https://pydantic-docs.helpmanual.io/usage/validators/

# 应用
```python
from typing import List
from pydantic import BaseModel, constr
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Integer, String, Column

Base = declarative_base()


class CompanyOrm(Base):
    __tablename__ = 'companies'
    id =Column(Integer, primary_key=True, nullable=True)
    public_key = Column(String(20), index=True, nullable=False, unique=True)
    name = Column(String(100), unique=True)
    domains = Column(ARRAY(String(255)))


class CompanyModel(BaseModel):
    id: int
    public_key: constr(max_length=20)
    name: constr(max_length=100)
    domains: List[constr(max_length=255)]

    class Config:
        orm_mode = True


co_orm = CompanyOrm(
    id=1,
    public_key="akey",
    name="andy",
    domains=['123.com', '456.com']
)
print(CompanyModel.from_orm(co_orm))

```