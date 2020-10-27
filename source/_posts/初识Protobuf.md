---
title: 初识Protobuf
abbrlink: 87eb1013
date: 2020-10-26 14:44:54
tags:
---
## 常见数据加密三种方式

常见的对数据加密有三种情况：

第一种是，用诸如AES这类加密算法对数据加密，然后在用key进行解密，这类的数据解密的难度不是很大，弄清楚是用的什么加密算法就能反解。

第二种是，用“私有”协议把数据序列化，只有了解该协议的细节才有可能把数据反序列化出来。

第三种是，用第三方厂商的协议来数据序列化，自己搞不出来私有协议的就选用第三方厂商的。比如用 Google 的 Protobuf ，来做数据序列化，也就是数据“加密”。

## Protobuf介绍

Protobuf应该是Protoc buffers（协议缓冲区），官方解释直接翻译官网的介绍，概括一下就是：Protocol buffers are a flexible, efficient, automated mechanism for serializing structured data – think XML, but smaller, faster, and simpler. You define how you want your data to be structured once, then you can use special generated source code to easily write and read your structured data to and from a variety of data streams and using a variety of languages. You can even update your data structure without breaking deployed programs that are compiled against the "old" format. 

翻译一下就是：协议缓冲区是一种灵活，高效，自动化的机制，用于序列化结构化数据 - 想想XML，但更小，更快，更简单。 您可以定义数据的结构化结构，然后使用特殊生成的源代码轻松地将结构化数据写入和读取各种数据流，并使用各种语言。 您甚至可以更新数据结构，而不会破坏根据“旧”格式编译的已部署程序。

**protobuf是一种与平台无关，语言无关、可扩展且轻便高效序列化数据结构的协议，可用于网络通讯和数据存储。想象你有一个Person类，类里面有很多成员属性，然后你想把一个Person对象发送到另外一台机器上，一般而言，你是不能直接将这个对象是发送过去的，你需要将这个类序列化，以字节流的形式发送，那么你如何将你的对象序列化，就是一个问题，而且你还要考虑到接收端将数据反序列化。Protobuf就是来做这个事情的，它本身与具体语言无关，支持绝大多数主流编程语言，如C++，java，python，C#等。或者，你可以理解为加密文件，你要发的汉子通过加密后编程了一堆不同排列的小圆点，只要你的朋友有这个加密文件，他就能将你加密的东西翻译过来。**

## 使用

https://github.com/protocolbuffers/protobuf/releases/

在 Google 官方 github 地址下载 Protobuf  。下载一个 Protobuf 编译器和一个调用编译器的接口程序。这里有不同语言，不同操作系统。(注意要给 protoc 配置上环境变量，不然没法全局调用该命令。E:\python3.7.2\protoc-3.12.3-win64\bin，C:\Users\mr_zhang>protoc --version输出)

1. 解压 protobuf-python-xx.zip 这是Python模块，cd到（protobuf-xx\python）目录里运行python3 setup.py build 和 python3 setup.py install 安装Python模块

2. Python编辑器里运行 import google.protobuf 可以检测是否安装成功。

3. E:\python3.7.2\protobuf-3.12.3\examples 目录下给出了实例

4. 编写写一个 .proto 语法文件，https://colobu.com/2017/03/16/Protobuf3-language-guide/

    ```
    首先我们需要创建一个以.proto结尾的文件，可以在其中定义message来指定所需要序列化的数据格式。每一个message都是一个小的信息逻辑单元，包含一系列的name-value值对。以官网上的示例，我们创建一个addressbook.proto文件，内容如下所示。
    
    syntax = "proto2";
    
    package tutorial;
    
    message Person {
      required string name = 1;
      required int32 id = 2;
      optional string email = 3;
    
      enum PhoneType {
        MOBILE = 0;
        HOME = 1;
        WORK = 2;
      }
    
      message PhoneNumber {
        required string number = 1;
        optional PhoneType type = 2 [default = HOME];
      }
    
      repeated PhoneNumber phones = 4;
    }
    
    message AddressBook {
      repeated Person people = 1;
    protoc -I=\$SRC_DIR --python_out=\$DST_DIR \$SRC_DIR/addressbook.proto
    syntax=”proto2”代表版本，目前支持proto2和proto3，不写默认proto2。
    package类似于C++中的namespace概念。
    message是包含了各种类型字段的聚集，相当于struct，并且可以嵌套。
    proto3版本去掉了required和optional类型，保留了repeated(数组)。其中“＝1”，“＝2”表示每个元素的标识号，它会用在二进制编码中对域的标识，[1,15]之内的标志符在使用时占用一个字节，[16,2047]之内的标识号则占用2个字节，所以从最优化角度考虑，可以将[1,15]使用在一些较常用或repeated的元素上。同时为了考虑将来可能会增加新的标志符，我们要事先预留一些标志符。
    构建好addressbook.proto文件后，运行Protobuf编译器编译.proto文件，运行方法如下所示。其中-I表示.protoc所在的路径(如果你没有配置环境变量需要，配置了就不需要)，--python_out表示指定生成的目标文件存在的路径，最后的参数表示要编译的.proto文件。
    
    protoc -I=\$SRC_DIR --python_out=\$DST_DIR \$SRC_DIR/addressbook.proto
    
    
    protoc --python_out=. demo01.proto
    ```

5. 编译完成之后会生成demo01_pb2.py文件，里面包含序列化和反序列化等方法。

6. 如何使用生成的py文件

    ```
    syntax = "proto2";
    
    package tutorial;
    
    message Person {
      required string name = 1;
      required int32 id = 2;
      optional string email = 3;
    
      enum PhoneType {
        MOBILE = 0;
        HOME = 1;
        WORK = 2;
      }
    
      message PhoneNumber {
        required string number = 1;
        optional PhoneType type = 2 [default = HOME];
      }
    
      repeated PhoneNumber phones = 4;
    }
    
    message AddressBook {
    // singular：一个格式良好的消息应该有0个或者1个这种字段（但是不能超过1个）。
    // repeated：在一个格式良好的消息中，这种字段可以重复任意多次（包括0次）。重复的值的顺序会被保留
      repeated Person people = 1; 
    }
    
    ######################################
    
    import demo01_pb2
    address_book = demo01_pb2.AddressBook()
    person = address_book.people.add()
    phone = person.phones.add()
    # 赋值
    person.name = "jane"
    person.id = 89757
    person.email = "lucking@goole.com"
    
    phone.number = "123421212"
    phone.type = 2
    
    print(address_book.SerializeToString())
    
    ```

7. 逆向解析 Protobuf，protoc --decode_raw < 需要解析的文件

    ```bash
    C:\Users\mr_zhang\Desktop\protobuf>protoc --decode_raw < data_file.bin
    1 {
      1: "jane"
      2: 89757
      3: "lucking@goole.com"
      4 {
        1 {
          6: 0x3231323132343332
        }
        2: 2
      }
    }
    
    ```

8. 逆向出 .proto 文件格式，根据你自己写的，对比结果，然后从结果推出文件格式

