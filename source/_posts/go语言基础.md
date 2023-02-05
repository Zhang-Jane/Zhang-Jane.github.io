---
title: go语言基础
abbrlink: 80db8027
tags: go语言
categories: go语言
date: 2023-02-05 15:50:08
---
**Go是一门强类型静态编程语言**

## 数据类型
GO语言提供了类型推导的语法糖，`:=`，注意，使用此声明变量的时候，左边的值中至少要有一个变量必须是为定义，否则会出现`no new variables on left side of := `，而且它不能出现在全局的变量声明和初始化。
```go
var a = 10
或则
a := 10
```
### bool类型

布尔型的值只可以是常量 true 或者 false。一个简单的例子：var b bool = true

### 数值型

#### 整数型
范围的计算机规则$$无符号的：0-2^n \\ 有符号：-2^{n}/2,2^{n}/2 -1$$
-   int8 有符号 8 位整型 (-128 到 127) 长度：8bit
-   int16 有符号 16 位整型 (-32768 到 32767)
-   int32 有符号 32 位整型 (-2147483648 到 2147483647)
-   int64 有符号 64 位整型 (-9223372036854775808 到 9223372036854775807)
-   uint8 无符号 8 位整型 (0 到 255) 8位都用于表示数值：
-   uint16 无符号 16 位整型 (0 到 65535)
-   uint32 无符号 32 位整型 (0 到 4294967295)
-   uint64 无符号 64 位整型 (0 到 18446744073709551615)

#### 浮点型
-   float32  32位浮点型数
-   float64  64位浮点型数


### 字符

Golang中没有专门的字符类型，如果要存储单个字符(字母)，一般使用byte来保存。

字符串就是一串固定长度的字符连接起来的字符序列。Go的字符串是由单个字节连接起来的。也就是说<span style="background:#ff4d4f">对于传统的字符串是由字符组成的，而Go的字符串不同，它是由字节组成的</span>。
字符常量只能使用单引号(`''`)括起来

**go语言的字符有俩种类型**
- byte（代表ASCII编码的一个字符）
- rune（代表UTF-8编码的一个字符）
### 字符串

字符串就是一串固定长度的字符连接起来的字符序列。Go 的字符串是由单个字节连接起来的。Go 语言的字符串的字节使用 UTF-8 编码标识 Unicode 文本。
用双引号(`""`)括起来

### 注意

-   byte 等于 uint8
-   rune 等于 int32
- 多行字符串用\`\`
- 统计字符长度
	-  ASCII 字符串长度使用 len() 函数。
	-  Unicode 字符串长度使用 utf8.RuneCountInString() 函数。
- 最好使用`for range`来遍历数组，切片，字符串，map，以及channel
## code
```go
// 关于字符串遍历的时候出现的某些问题，中文的采用的是utf-8的编码（一个中文占三个字节）
package main
import "fmt"
func main(){
   var str = "abc北京"
    str2 := []rune(str)
	for i :=0; i < len(str); i++ {
    ch := str[i]
      fmt.Printf("str[%d]=%c\n", i, ch)
  }
	// range自动帮你转换了
    for i, ch := range str {
        fmt.Printf("str[%d]=%c\n", i, ch)
    }
}
```
```go
package main

import "fmt"

func main() {
	/* 定义局部变量 */
	var a int = 1
	/* 
    循环:
    break: 中止当前的循环，如果有嵌套，无法影响后面的运行
    goto:无条件的跳转到相同函数中带标签的语句

    */
	LOOP: for a < 10 {
		if a == 5 {
			/* 跳过迭代 */
			a = a + 1
			goto LOOP
		}
        if a == 3 {
		    fmt.Printf("a的break值为 : %d\n", a)
            break
        } 
		fmt.Printf("a的值为 : %d\n", a)
		a++
	}
}
```
```go
package main

  

import (

    "fmt"

    "strings"

)

  

func main() {

    //字符串基本操作

    //1. 求解字符串的长度

    //返回的是字节的长度

    //涉及到中文问题就产生了变化

    //unicode 字符集， 存储的时候需要编码 utf8编码规则， utf8编码是一个动态的编码规则

    //utf8编码， 还能够用一个字节表示英文

    //var name string = "bobby:\"慕课网\"" //转义符

    //fmt.Println(len(name))

    ////类型转换

    //name_arr := []int32(name)

    //fmt.Println(len(name_arr))

  

    //date := "2020\\06\\18" //转义符

    //fmt.Println(date)

    //2. 是否包含某个子串

    var name string = "bobby:\"慕课网\""

    fmt.Println(strings.Contains(name, "慕课网"))

    fmt.Println(strings.Index(name, "慕课网"))

  

    //2. 统计出现的次数

    fmt.Println(strings.Count(name, "b"))

  

    //3. 前缀和后缀

    fmt.Println(strings.HasPrefix(name, "o"))

    fmt.Println(strings.HasSuffix(name, "\""))

  

    //4. 大小写转换

    fmt.Println(strings.ToUpper("bobby"))

    fmt.Println(strings.ToLower("BOBBY"))

  

    //5. 字符串的比较

    fmt.Println(strings.Compare("ab", "aa")) //字符的比较就是ascii的比较 返回-1， 1， 0

    fmt.Println(strings.Compare("b", "a"))   //字符的比较就是ascii的比较 返回-1， 1， 0

    fmt.Println(strings.Compare("b", "b"))   //字符的比较就是ascii的比较 返回-1， 1， 0

  

    //6. 去掉空格和指定字符串

    fmt.Println(strings.TrimSpace(" bobby "))

    fmt.Println(strings.TrimLeft("bobby", "b"))

    fmt.Println(strings.Trim("bobby", "b"))

  

    //7. split方法

    fmt.Println(strings.Split("bobby imooc", " "))

  

    //8. 合并 join方法将字符串数组连接起来

    arrs := strings.Split("bobby imooc", " ")

    fmt.Println(strings.Join(arrs, "-"))

  

    //9. 字符串替换

    fmt.Println(strings.Replace("bobby: 18 电话：18888888", "18", "19", 2))

  

}
```
## 高级类型
### 数组
Go 语言提供了数组类型的数据结构。 数组是具有相同唯一类型的一组已编号且长度固定的数据项序列，这种类型可以是任意的原始类型例如整形、字符串或者自定义类型。
数组元素可以通过索引（位置）来读取（或者修改），索引从0开始，第一个元素索引为 0，第二个索引为 1，以此类推。数组的下标取值范围是从0开始，到长度减1。
数组一旦定义后，大小不能更改。

<font color="#00b050">如果我就想在数组中定义不同类型，怎么办？</font>

使用interface
```go
package main

import "fmt"
type container interface{}
func main() {
  // li := [] int {1, 2, 4, 6}
  li2 := [...] container {1, '1', '一', true}
  fmt.Println(li2)
  // 默认给指定的位置初始化值
  f := [...]int{0:1, 4:1, 9:100}
  fmt.Println(f)
  f2 := [2] string {"helo", "world", "nihao"}
  fmt.Println(f2)
}

```
<span style="background:#b1ffff">需要注意的是：数组是值类型</span>
数组是值类型 Go中的数组是值类型，而不是引用类型。这意味着当它们被分配给一个新变量时，将把原始数组的副本分配给新变量。如果对新变量进行了更改，则不会在原始数组中反映。

注意：
- 数组的大小是类型的一部分。因此[5]int和[25]int是不同的类型。因此，数组不能被调整大小

### 切片
Go 数组的长度不可改变，在特定场景中这样的集合就不太适用，Go中提供了一种灵活，功能强悍的内置类型切片("动态数组"),与数组相比切片的长度是不固定的，可以追加元素，在追加时可能使切片的容量增大。
注意：
-  切片的传递是引用传递
直接声明
`var slice []int`

new
`slice := *new([]int)`

字面量
`slice := []int{1,2,3,4,5}`

make
`slice := make([]int, 5, 10)`

从切片或数组“截取”
`slice := array[1:5]` 或 `slice := sourceSlice[1:5]`

底层存储

[https://blog.csdn.net/kikajack/article/details/79833674](https://blog.csdn.net/kikajack/article/details/79833674)

go和python的切片区别

[https://blog.csdn.net/qq_15437667/article/details/70191873](https://blog.csdn.net/qq_15437667/article/details/70191873)

slice扩容机制
1. 如果当前所需容量 （cap） 大于原先容量的两倍 （doublecap），则最终申请容量（newcap）为当前所需容量（cap）；

2. 如果<条件1>不满足，表示当前所需容量（cap）不大于原容量的两倍（doublecap），则进行如下判断；

3. 如果原切片长度（old.len）小于1024，则最终申请容量（newcap）等于原容量的两倍（doublecap）；

4. 否则，最终申请容量（newcap，初始值等于 old.cap）每次增加 newcap/4，直到大于所需容量（cap）为止，然后，判断最终申请容量（newcap）是否溢出，如果溢出，最终申请容量（newcap）等于所需容量（cap）；
### map
在 Go 语言中，map 中的 key 类型必须是可比较的类型。这意味着 key 类型必须是能够进行相等性比较的类型，比如整数类型、字符串类型、指针类型等。
key的常用类型：int, rune, string, 结构体(每个元素需要支持 == or != 操作), 指针

```go
// 1 字面值
{
    m1 := map[string]string{"m1": "v1", // 定义时指定的初始key/value, 后面可以继续添加    }   
}
// 2 使用make函数
{
    m2 := make(map[string]string) // 创建时，里面不含元素，元素都需要后续添加    
    m2["m2"] = "v2"               // 添加元素    

}
// 定义一个空的map
{
    m3 := map[string]string{}    
    m4 := make(map[string]string)    
}
	// m0 可以, key类型为string, 支持 == 比较操作
	{
		var m0 map[string]string // 定义map类型变量m0，key的类型为string，value的类型string
		fmt.Println(m0)
	}

	// m1 不可以, []byte是slice，不支持 == != 操作，不可以作为map key的数据类型
	{
		var m1 map[[]byte]string // 报错： invalid map key type []byte
		fmt.Println(m1)

		准确说slice类型只能与nil比较，其他的都不可以，可以通过如下测试：
		var b1,b2 []byte
		fmt.Println(b1==b2) // 报错： invalid operation: b1 == b2 (slice can only be compared to nil)
	}

	// m2 可以, interface{}类型可以作为key，但是需要加入的key的类型是可以比较的
	{
		var m2 map[interface{}]string
		m2 = make(map[interface{}]string)
		m2[[]byte("k2")]="v2" // panic: runtime error: hash of unhashable type []uint8
		m2[123] = "123"
		m2[12.3] = "123"
		fmt.Println(m2)
	}

	// m3 可以， 数组支持比较
	{
		a3 := [3]int{1, 2, 3}
		var m3 map[[3]int]string
		m3 = make(map[[3]int]string)
		m3[a3] = "m3"
		fmt.Println(m3)
	}

	// m4 可以，book1里面的元素都是支持== !=
	{
		type book1 struct {
			name string
		}
		var m4 map[book1]string
		fmt.Println(m4)
	}

	// m5 不可以, text元素类型为[]byte, 不满足key的要求
	{
		type book2 struct {
			name string
			text []byte //没有这个就可以
		}
		var m5 map[book2]string //invalid map key type book2
		fmt.Println(m5)
	}


```

注意：
-   遍历的顺序是随机的
-   使用for range遍历的时候，k,v使用的同一块内存，这也是容易出现错误的地方
```go
// 遍历的顺序是随机的
m := map[string]int{
		"a": 1,
		"b": 2,
	}
	for k, v := range m {
		fmt.Printf("k:[%v].v:[%v]\n", k, v) // 输出k,v值
	}
/*
k:[b].v:[2]
k:[a].v:[1]
*/

// 虽然v的_地址没有变化_，但v的_内容在一直变化_，当遍历完成后，v的内容是map遍历时最后遍历的元素的。当程序将v的地址放入到slice中的时候，slice在不断地将v的地址插入，由于v一直是那块地址，因此slice中的每个元素记录的都是v的地址。因此当打印slice中的内容的时候，都是同一个值。就好比一直在给一个变量赋不同的值
m := map[string]int{
		"a": 1,
		"b": 2,
	}
	var bs []*int
	for k, v := range m {
		fmt.Printf("k:[%p].v:[%p]\n", &k, &v) // 这里的输出可以看到，k一直使用同一块内存，v也是这个状况
		bs = append(bs, &v) // 对v取了地址
	}

	// 输出
	for _, b := range bs {
		fmt.Println(*b) // 输出都是1或者都是2
	}
```

### make和new
Go语言中 new 和 make 是两个内置函数，主要用来创建并分配类型的内存。
在声明变量的时候，都有默认值：
- 默认值是它所属类型的零值。
	- `int` 型它的零值为 `0`
	- `string` 的零值为 `""`
	- 引用类型的零值为 `nil`。
- 如果是一个<font color="#7030a0">引用类型，我们不仅要声明它，还要为它分配内存空间，否则我们赋值就无处安放</font>。
- 值类型的声明不需要我们分配内存空间，因为已经默认给我们分配好啦。
```go
// 此内置函数用于分配内存，第一个参数接收一个类型而不是一个值，函数返回一个指向该类型内存地址的指针，同时把分配的内存置为该类型的零值。
func new(Type) *Type
var p *int = new(int) //go的编译器就知道先申请一个内存空间，这里的内存中的值全部设置为0
*p = 10

// 与 new 不同的是，它一般只用于 `chan`，`map`，`slice` 的初始化，并且直接返回这三种类型本身
func make(t Type, size ...IntegerType) Type
d := make([]int, 0)
```
区别：
- new函数返回的是这个值的地址指针； make函数返回的是指定类型的实例
- new 用于给类型分配内存空间，并且置零；make 只用于 chan，map，slice 的初始化。
### 接口( 接口命名习惯以 er 结尾)
在Go语言中接口（interface）是一种类型，一种抽象的类型。

interface是一组method的集合，是duck-type programming的一种体现。接口做的事情就像是定义一个协议（规则），只要一台机器有洗衣服和甩干的功能，我就称它为洗衣机。不关心属性（数据），只关心行为（方法）。
```go
type 接口类型名 interface{
	方法名1( 参数列表1 ) 返回值列表1
	方法名2( 参数列表2 ) 返回值列表2
	…
}
```
```go
package main

import (
	"fmt"
)

//接口是一个协议- 程序员 - 只要你能够 1. 写代码 2. 解决bug 其实就是一组方法的集合
type Programmer interface {
	Coding() string //方法只是申明
	Debug() string
}
type Designer interface {
	Design() string
}
type Manger interface {
	Programmer
	Designer
	Manage() string
}

type G struct {

}

//java的话 java里面一种类型只要继承一个接口 才行 如果你继承了这个接口的话 那么这个接口里面的所有方法你必须要全部实现
type UIDesigner struct {
}

func (d UIDesigner) Design() string{
	fmt.Println("我会ui设计")
	return "我会ui设计"
}

type Pythoner struct {
	UIDesigner
	lib []string
	kj []string
	years int
}


func (p G) Coding() string{
	fmt.Println("go开发者")
	return "go开发者"
}

func (p G) Debug() string{
	fmt.Println("我会go的debug")
	return "我会go的debug"
}

func (p Pythoner) Coding() string{
	fmt.Println("python开发者")
	return "python开发者"
}

func (p Pythoner) Debug() string{
	fmt.Println("我会python的debug")
	return "我会python的debug"
}

func (p Pythoner) Manage() string{
	fmt.Println("不好意思，管理我也懂")
	return "不好意思，管理我也懂"
}
func main()  {
	//新的语言出来了, 接口帮我们完成了go语言的多态
	//var pro Programmer = Pythoner{}

	var pros []Programmer
	pros = append(pros, Pythoner{})
	pros = append(pros, G{})

	//接口虽然是一种类型 但是和其他类型不太一样 接口是一种抽象类型 struct是具象
	p := Pythoner{}
	fmt.Printf("%T\n", p)
	var pro Programmer = Pythoner{}
	fmt.Printf("%T\n", pro)
	var pro2 Programmer = G{}
	fmt.Printf("%T", pro2)
	}
```
### 结构体(首字母大写公共，小写私有)
Go 语言中的结构体（struct）是一种自定义的类型，它可以用来组合多个不同类型的数据字段（field）成为一个单独的实体。例如，你可以定义一个结构体表示人的信息，包括他的名字、年龄、身高等，而每个字段的类型可以是 string、int 或 float64 等。
```go
package main

import (
	"fmt"
	"unsafe"
)


type Course struct {
	Name string
	Price int
	Url string
}

//函数的接收者
func (c Course) printCourseInfo()  {
	fmt.Printf("课程名:%s, 课程价格: %d, 课程的地址:%s", c.Name, c.Price, c.Url)
}
func (c *Course) setPrice(price int){
	c.Price = price
}

//1. 结构体的方法只能和结构体在同一个包中
//2. 内置的int类型不能加方法

func main()  {
	//go语言不支持面向对象
	//面向对象的三个基本特征： 1. 封装 2. 继承 3. 多态 4. 方法重载 4. 抽象基类
	//定义struct go语言没有class这个概念 所以说对于很多人来说会少理解很多面向对象抽象的概念

	//1. 实例化- kv形式
	var c Course = Course{
		Name: "django",
		Price: 100,
		Url: "https://www.imooc.com",
	}

	//访问
	fmt.Println(c.Name, c.Price, c.Url)

	//大小写在go语言中的重要性 可见性
	//一个包中的变量或者结构体如果首字母是小写 那么对于另一个包不可见
	//机构体定义的 名称 以及属性首字母大写很重要

	//2. 第二种实例化方式 - 顺序形式
	c2 := Course{"scrapy", 110, "https://www.imooc.com"}
	fmt.Println(c2.Name, c2.Price, c2.Url)

	//3. 如果一个指向结构体的指针, 通过结构体指针获取对象的值， 让很多人莫名其妙
	c3 := &Course{"tornado", 100, "https://www.imooc.com"}
	//fmt.Printf("%T", c3)
	//应该能看出来 go语言实际上在借鉴动态语言的特性 - 很多地方不管如何写都是正确的
	//另一个根本的原因 - go语言的指针是受限的
	fmt.Println(c3.Name, c3.Price, c3.Url) //这里其实是go语言的一个语法糖 go语言内部会将c3.Name转换成 (*c3).Name

	//4. 零值 如果不给结构体赋值， go语言会默认给每个字段采用默认值
	c4 := Course{}
	fmt.Println(c4.Price,)
	
	//5. 多种方式零值初始结构体
	var c5 Course = Course{}
	var c6 Course
	var c7 *Course = &Course{}
	//为什么c6和c8表现出来的结果不一样 指针如果只申明不赋值 默认值是nil c6不是指针 是结构体的类型
	//slice map

	fmt.Println("零值初始化")
	fmt.Println(c5.Price)
	fmt.Println(c6.Price)
	fmt.Println(c7.Price)

	//6. 结构体是值类型
	c8 := Course{"scrapy", 110, "https://www.imooc.com"}
	c9 := c8
	fmt.Println(c8)
	fmt.Println(c9)
	c8.Price = 200
	fmt.Println(c8)
	fmt.Println(c9)

	//go语言中struct无处不在
	//7. 结构体的大小 占用内存的大小 可以使用sizeof来查看对象占用的类型
	fmt.Println(unsafe.Sizeof(1))
	//go语言string的本质 其实string是一个结构体
	fmt.Println(unsafe.Sizeof(""))
	fmt.Println(unsafe.Sizeof(c8))

	//8. slice的大小
	type slice struct {
		array unsafe.Pointer  // 底层数组的地址
		len int // 长度
		cap int // 容量
	}

	s1 := []string{"django", "tornado", "scrapy", "celery", "snaic", "flask"}
	fmt.Println("切片占用的内存:", unsafe.Sizeof(s1))

	m1 := map[string]string {
		"bobby1": "django",
		"bobby2": "tornado",
		"bobby3": "scrapy",
		"bobby4": "celery",
	}
	fmt.Println(unsafe.Sizeof(m1))

	//结构体方法， 达到了封装数据和封装方法的效果
	c10 := Course{"scrapy", 110, "https://www.imooc.com"}
	//Course.setPrice(c10, 200)
	(&c10).setPrice(200) //修改c10的price? 为什么呢？ 语法糖 函数参数的传递是怎么传递的？ 结构体是值传递
	fmt.Println(c10.Price)
	//c10.printCourseInfo()

	//结构体的接收者有两种形式 1. 值传递 2. 指针传递 如果你想改结构体的值 如果结构体的数据很大
	//go语言不支持继承 但是有办法能达到同样的效果 组合

}

```

#### 结构体标签
```go
package main

import (
	"encoding/json"
	"fmt"
	"reflect"
)

//结构体能基本上达到类的一个效果 多态
type Info struct { //能表述的信息是有限的
	Name string `json:"name"`//name是映射成mysql中char类型还是varchar类型还是text类型， 即使能够说明 但是额外的信息 max_length
	Age int `json:"age,omitempty"`
	Gender string `json:"-"`
}

//type Info struct { //能表述的信息是有限的
//	Name string `orm:"name, max_length=17, min_length=5"`
//	Age int `orm:"age, min=18, max=70"`
//	Gender string `orm:"gender, required"`
//}

//反射包

func main()  {
	//结构体标签
	/*
	结构体的字段除了名字和类型外，还可以有一个可选的标签（tag）：
	它是一个附属于字段的字符串，可以是文档或其他的重要标记。
	比如在我们解析json或生成json文件时，常用到encoding/json包，
	它提供一些默认标签，例如：omitempty标签可以在序列化的时候忽略0值或者空值。
	而-标签的作用是不进行序列化，其效果和和直接将结构体中的字段写成小写的效果一样。
	 */
	info := Info{
		Name: "bobby",
		Gender:"男",
	}
	re, _ := json.Marshal(info)
	fmt.Println(string(re))

	//通过反射包去识别这些tag 简单的体验了一下反射的威力 spring 底层都是反射
	t := reflect.TypeOf(info)
	fmt.Println("Type:", t.Name())
	fmt.Println("Kind:", t.Kind())

	for i := 0; i<t.NumField(); i++ {
		field := t.Field(i) //获取结构体的每一个字段
		tag := field.Tag.Get("orm")
		fmt.Printf("%d. %v (%v), tag: '%v'\n", i+1, field.Name, field.Type.Name(), tag)
	}
	//具体的应用绝大部分情况之下我们是不需要使用到反射的 实际开发的项目中会用到的
	//接口 java 实际上在go语言中接口这个概念的地位和java中接口的地位是不一样， go语言的接口实际上就是python中的协议 - 鸭子类型
}

```

#### 结构体-方法
Go 语言不是面向对象的语言，它里面不存在类的概念，结构体正是类的替代品。类可以附加很多成员方法，结构体也可以。

```go
package main
import "fmt"
import "math"
type Circle struct {
 x int y int Radius int
}
// 面积
func (c Circle) Area() float64 {
 return math.Pi * float64(c.Radius) * float64(c.Radius)
}
// 周长
func (c Circle) Circumference() float64 {
 return 2 * math.Pi * float64(c.Radius)
}
func main() {
 var c = Circle {Radius: 50} 
 fmt.Println(c.Area(), c.Circumference()) // 指针变量调用方法形式上是一样的 var pc = &c fmt.Println(pc.Area(), pc.Circumference())
}
```
### go语言中的type
Go语言中的`type`关键字用于定义新的数据类型。在Go语言中，一个新的类型可以是一个结构体类型，接口类型，函数类型或基本类型（如int、string等）的别名。

例如，你可以使用`type`关键字定义一个新的类型`MyInt`，它是`int`类型的别名：

```go
type MyInt int
```

之后，你可以使用`MyInt`类型定义新的变量，就像使用其它基本类型一样：

```go
var myIntVar MyInt = 5
```
## 作用域
**golang中根据首字母的大小写来确定可以访问的权限。无论是方法名、常量、变量名还是结构体的名称，如果首字母大写，则可以被其他的包访问；如果首字母小写，则只能在本包中使用。**
函数内部声明/定义的变量叫局部变量，作用域仅限于函数内部
```go
func test() {
	// age 和 Name的作用域就只在test函数内部，即便是首字母为大写
	age := 10
	Name := "tom~"
    fmt.Println("age=", age) 
	fmt.Println("Name=", Name)  
}
```
函数外部声明/定义的变量叫全局变量，作用域在整个包都有效，如果其首字母为大写，则作用域在整个程序有效
```go

// 函数外部声明/定义的变量叫全局变量，
// 作用域在整个包都有效，如果其首字母为大写，则作用域在整个程序有效
var age int = 50
var Name string = "jack~"
func main() {
	fmt.Println("age=", age) //  50
	fmt.Println("Name=", Name) // jack~

```
如果变量是在一个代码块，比如 for / if 中，那么这个变量的的作用域就在该代码块
```go
func main() {
	// 如果变量是在一个代码块，比如 for 
	for i := 0; i <= 10; i++ {
		fmt.Println("i=", i)
	}
 
	var i int //局部变量
	for i = 0; i <= 10; i++ {
		fmt.Println("i=", i)
	}
	fmt.Println("i=", i)
```

## 函数
```go
package main
import (
  "fmt"
)
func xx() {
// Go语法上不允许函数嵌套，但是支持匿名函数的嵌套
  // func xy() {
  //   fmt.println(a)
  // }
  fu := func () {
    fmt.Println(a)
  }
  fu()
  var a = 20 
  fmt.Println(a) 
}
func main() {
  xx()
}
```
函数声明包含一个函数名，参数列表， 返回值列表和函数体。如果函数没有返回值，则返回列表可以省略。函数从第一条语句开始执行，直到执行return语句或者执行函数的最后一条语句。

函数可以没有参数或接受多个参数。

注意类型在变量名之后 。

当两个或多个连续的函数命名参数是同一类型，则除了最后一个类型之外，其他都可以省略。

函数可以返回任意数量的返回值。

使用关键字 func 定义函数，左大括号依旧不能另起一行。
```go
package main

import "fmt"

func test(fn func() int) int {
    return fn()
}
// 定义函数类型。
type FormatFunc func(s string, x, y int) string 

func format(fn FormatFunc, s string, x, y int) string {
    return fn(s, x, y)
}

func main() {
    s1 := test(func() int { return 100 }) // 直接将匿名函数当参数。

    s2 := format(func(s string, x, y int) string {
        return fmt.Sprintf(s, x, y)
    }, "%d, %d", 10, 20)

    println(s1, s2)
}
// 100 10, 20
```
## 指针
```go
package main

import "fmt"

func swap(a *int, b *int){
	//用于交换a和b
	c := *a
	*a = *b
	*b = c
}
func main() {
	//什么指针，我们提一个问题
	a := 10
	b := 20
	//swap(a, b)
	fmt.Println(a, b)
	//为什么交换不成功， 这个函数运行完成以后 我想要把a和b的值变掉
	//指针 - 对于内存来说，每一个字节其实都是有地址-通过16进制打印出来
	fmt.Printf("%p\n", &a) //变量有地址
	//现在有一种特殊的变量类型，这个变量只能保存地址值
	var ip *int //这个变量里面就只能保存地址类型这种值
	ip = &a

	//如果要修改指针指向的变量的值，用法也比较特殊
	*ip = 30
	fmt.Println(a)
	//如何定义指针变量 如果修改指针变量指向的内存中的值。 通过指针去取值的时候不知道应该取多大的连续内存空间
	fmt.Printf("ip所指向的内存空间地址是：%p, 内存中的值是: %d\n",ip, *ip)
	swap(&a, &b)
	fmt.Println(a, b)
	//还不足以说服大家
	//但是go中数组是值传递 数组中有100万个值， 对于这种一般我们都采用切片来传递
	//在python中list和dict这种传递都是引用传递

	//指针还可以指向数组 指向数组的指针 数组是值类型
	arr := [3]int{1,2,3}
	var ip *[3]int = &arr
	//指针数组
	var ptrs [3]*int //创建能够存放三个指针变量的数组
	//很多时候都是函数参数的时候指明的类型
	//指针的默认值是nil
	if ip != nil {

	}
	//像python和java这种语言都是极力的屏蔽指针， c/c++ 都提供了指针 指针本身是很强大
	//c和c++中指针的功能很强大 指针的转换 指针的偏移 指针的运算
	//go语言没有屏蔽指针，但是go语言在指针上做了大量的限制，安全性高很多，相比较 c和c++灵活性就降低了
	//指针变量中涉及到两个符号 & 和 *

	//make， new， nil
}

```
## defer,panic,error,recover
### defer特性
    1. 关键字 defer 用于注册延迟调用。
    2. 这些调用直到 return 前才被执。因此，可以用来做资源清理。
    3. 多个defer语句，按先进后出的方式执行。
    4. defer语句中的变量，在defer声明时就决定了。
    5. defer之后只能是函数调用 不能是表达式
```go
package main
import "fmt"

func main()  {
	//defer语句执行时的拷贝机制
	x := 10
	//此处的defer函数并没有参数，函数内部使用的值是全局的值
	defer func (a *int) {
		fmt.Println(x)
		fmt.Println(*a)
	}(&x)
    defer func () {
      x++
      fmt.Println(x)
    }()
	x++
}

/*
12
12
12
*/

// 比较下面俩种方式输出结果
x := 10
defer func () {
  x++
  fmt.Println(x)
}()
x++
//output: 12


func a() int {
x := 10
defer func (a int) {
  fmt.Println(x)
  x++
}(x)
tmp := x
return tmp
}
fmt.Println(a())
/*
output: 
10
10
*/
```
###  panic 和 error
在go语言中，异常和错误是区分的。
- 错误是程序中可能出现的问题，比如连接数据库失败，连接网络失败等，在程序设计中，错误处理是业务的一部分。
- 而异常指的是不应该出现问题的地方出现了问题，比如空指针引用，下标越界，向空 map 添加键值等，这种情况在人们的意料之外
- 对于真正意外的情况，那些表示不可恢复的程序错误，不可恢复才使用 panic。对于其他的错误情况，我们应该是期望使用 error 来进行判定
Go 提供了两种创建error的方法，分别是：  
`errors.New`  (https://pkg.go.dev/github.com/pkg/errors)
如果有一个现成的 `error` ，我们需要对他进行再次包装处理，这时候有三个函数可以选择
// 新生成一个错误, 带堆栈信息
func New(message string) error

// 只附加新的信息
func WithMessage(err error, message string) error

// 只附加调用堆栈信息
func WithStack(err error) error

// 同时附加堆栈和信息
func Wrapf(err error, format string, args ...interface{}) error

如果需要对源错误类型进行自定义判断可以使用 Cause,可以获得最根本的错误原因
// 获得最根本的错误原因
func Cause(err error) error

`fmt.Errorf`
```go
package main

import (
	"errors"
	"fmt"
)

func main() {
	res1, err1 := div(1, 1)
	fmt.Println(res1, err1)

	res2, err2 := div(1, 0)
	fmt.Println(res2, err2)
	
	//返回一个error
	e := fmt.Errorf("自定义error")
	fmt.Println(e)
}

func div(n, m int) (int, error) {
	if m == 0 {
		return 0, errors.New("0不能作为分母")
	}
	return m / n, nil
}

```
<font color="#7030a0">一般在没有recover的情况下panic会导致程序崩溃，panic，defer和recover经常同时出现，用于异常处理。</font>
```go
package main

import "fmt"

func main() {
	//注册捕获panic的函数,必须先注册，若在panic之后则无效
	defer doPanic()
	n := 0
	res := 1 / n
	fmt.Println(res) //panic 之后的代码不会执行
}

//当捕获到panic时触发此函数
func doPanic() {
	err := recover()
	if err != nil {
		fmt.Println("捕获到panic")
	}
}

```

## Goroutine
进程，线程，协程：
https://juejin.cn/post/7147756611929374756
https://zhuanlan.zhihu.com/p/94018082
<span style="background:#fdbfff">A. 进程是程序在操作系统中的一次执行过程，系统进行资源分配和调度的一个独立单位。</span>
<span style="background:#fdbfff">B. 线程是进程的一个执行实体,是CPU调度和分派的基本单位,它是比进程更小的能独立运行的基本单位。</span>
<span style="background:#fdbfff">C.一个进程可以创建和撤销多个线程;同一个进程中的多个线程之间可以并发执行。</span>
<span style="background:#fdbfff">协程：独立的栈空间，共享堆空间，调度由用户自己控制，本质上有点类似于用户级线程，这些用户级线程的调度也是自己实现的。</span>
<span style="background:#fdbfff">线程：一个线程上可以跑多个协程，协程是轻量级的线程。</span>

在java/c++中我们要实现并发编程的时候，我们通常需要自己维护一个线程池，并且需要自己去包装一个又一个的任务，同时需要自己去调度线程执行任务并维护上下文切换，这一切通常会耗费程序员大量的心智。那么能不能有一种机制，程序员只需要定义很多个任务，让系统去帮助我们把这些任务分配到CPU上实现并发执行呢？

Go语言中的goroutine就是这样一种机制，goroutine的概念类似于线程，但 goroutine是由Go的运行时（runtime）调度和管理的。Go程序会智能地将 goroutine 中的任务合理地分配给每个CPU。Go语言之所以被称为现代化的编程语言，就是因为它在语言层面已经内置了调度和上下文切换的机制。

Go语言中使用goroutine非常简单，只需要在调用函数的时候在前面加上go关键字，就可以为一个函数创建一个goroutine。
```go
package main

import (
	"fmt"
	"sync"
)
// 当main()函数返回的时候该goroutine就结束了，所有在main()函数中启动的goroutine会一同结束
var wg sync.WaitGroup
//WaitGroup提供了三个很有用的函数
/*
Add
Done
Wait
Add的数量和Done的数量必须相等
 */
func f(n int)  {
	defer wg.Done()
	fmt.Println(n)
}
func main() {
	wg.Add(5)
	for i := 0; i<5; i++ {
		go f(i)
	}
	wg.Wait()
}
```
go轻松开启100万个协程
```go

package main

import (
    "fmt"
    "sync"
    "time"
)

var wx sync.WaitGroup
func main() {
    for i:=0; i < 1000000; i++ {
        wx.Add(1)
        go func(i int){
            defer wx.Done()
            for {
                fmt.Println(i)
                time.Sleep(time.Second*1)
            }
        }(i)
    }
    wx.Wait()
}
}
```
注意，主协程退出了，其他任务也会退出
```go
import (
    "fmt"
    "time"
)

func main() {
    // 合起来写
    go func() {
        i := 0
        for {
            i++
            fmt.Printf("new goroutine: i = %d\n", i)
            time.Sleep(time.Second)
        }
    }()
    i := 0
    for {
        i++
        fmt.Printf("main goroutine: i = %d\n", i)
        time.Sleep(time.Second)
        if i == 2 {
            break
        }
    }
}

/*
main goroutine: i = 1
new goroutine: i = 1
new goroutine: i = 2
main goroutine: i = 2
*/
/*
解决这个问题，使用runtime包

runtime.Goexit()
调用此函数会立即使当前的goroutine的运行终止（终止协程），而其它的goroutine并不会受此影响。
runtime.Goexit在终止当前goroutine前会先执行此goroutine的还未执行的defer语句。请注意千万别在主函数调用runtime.Goexit，因为会引发panic。

runtime.GOMAXPROCS()
用来设置可以并行计算的CPU核数最大值，并返回之前的值。
*/
package main
import (
    "fmt"
    "runtime"
)

func main() {
    go func() {  //让子协程先执行
        for i := 0; i < 5; i++ {
            fmt.Println("go")
        }
    }()

    for i := 0; i < 2; i++ {
        //让出时间片，先让别的协议执行，它执行完，再回来执行此协程
        runtime.Gosched()
        fmt.Println("hello")
    }
}

package main

import (
    "fmt"
    "runtime"
)

func main() {
    go func() {
        defer fmt.Println("A.defer")
        func() {
            defer fmt.Println("B.defer")
            // 结束协程
            runtime.Goexit()
            defer fmt.Println("C.defer")
            fmt.Println("B")
        }()
        fmt.Println("A")
    }()
    for {
    }
}
```

总结：
单从线程调度讲，Go语言相比起其他语言的优势在于OS线程是由OS内核来调度的，goroutine则是由Go运行时（runtime）自己的调度器调度的，这个调度器使用一个称为m:n调度的技术（复用/调度m个goroutine到n个OS线程）。 其一大特点是goroutine的调度是在用户态下完成的， 不涉及内核态与用户态之间的频繁切换，包括内存的分配与释放，都是在用户态维护着一块大的内存池， 不直接调用系统的malloc函数（除非内存池需要改变），成本比调度OS线程低很多。 另一方面充分利用了多核的硬件资源，近似的把若干goroutine均分在物理线程上， 再加上本身goroutine的超轻量，以上种种保证了go调度方面的性能。
### Channel
虽然可以使用共享内存进行数据交换，但是共享内存在不同的goroutine中容易发生竞态问题。为了保证数据交换的正确性，必须使用互斥量对内存进行加锁，这种做法势必造成性能问题。

Go 语言中的通道（channel）是一种特殊的类型。通道像一个传送带或者队列，总是遵循先入先出（First In First Out）的规则，保证收发数据的顺序。每一个通道都是一个具体类型的导管，也就是声明channel的时候需要为其指定元素类型。
```go
var 变量 chan 元素类型
声明
var msg chan int
初始化
msg = make(chan int) // 不带缓冲区，无缓冲的通道只有在有人接收值的时候才能发送值
msg = make(chan int, 16) // 带缓冲区
将一个值发送到通道中
ch <- 10 // 把10发送到ch中
从一个通道中接收值
x := <- ch // 从ch中接收值并赋值给变量x
<-ch       // 从ch中接收值，忽略结果
close函数来关闭通道
close(ch)
v, ok := <-ch // 它可以用来检查Channel是否已经被关闭了
单向通道
1.chan<- int是一个只能发送的通道，可以发送但是不能接收；
2.<-chan int是一个只能接收的通道，可以接收但是不能发送。

关于关闭通道需要注意的事情是，只有在通知接收方goroutine所有的数据都发送完毕的时候才需要关闭通道。通道是可以被垃圾回收机制回收的，它和关闭文件是不一样的，在结束操作之后关闭文件是必须要做的，但关闭通道不是必须的。

关闭后的通道有以下特点：

1.对一个关闭的通道再发送值就会导致panic。
2.对一个关闭的通道进行接收会一直获取值直到通道为空。
3.对一个关闭的并且没有值的通道执行接收操作会得到对应类型的零值。
4.关闭一个已经关闭的通道会导致panic。

func recv(c chan int) {
    ret := <-c
    fmt.Println("接收成功", ret)
}
func main() {
    ch := make(chan int)
    go recv(ch) // 启用goroutine从通道接收值
    ch <- 10
    fmt.Println("发送成功")
}


```
### select

`select`语句选择一组可能的send操作和receive操作去处理。它类似`switch`,但是只是用来处理通讯(communication)操作。

如果有同时多个case去处理,比如同时有多个channel可以接收数据，那么Go会伪随机的选择一个case处理(pseudo-random)。如果没有case需要处理，则会选择`default`去处理，如果`default case`存在的情况下。如果没有`default case`，则`select`语句会阻塞，直到某个case需要处理。

需要注意的是，nil channel上的操作会一直被阻塞，如果没有default case,只有nil channel的select会一直被阻塞。
### timeout

`select`有很重要的一个应用就是超时处理。 因为上面我们提到，如果没有case需要处理，select语句就会一直阻塞着。这时候我们可能就需要一个超时操作，用来处理超时的情况。

下面这个例子我们会在2秒后往channel c1中发送一个数据，但是`select`设置为1秒超时,因此我们会打印出`timeout 1`,而不是`result 1`。
```go
import "time"
import "fmt"
func main() {
    c1 := make(chan string, 1)
    go func() {
        time.Sleep(time.Second * 2)
        c1 <- "result 1"
    }()
    select {
    case res := <-c1:
        fmt.Println(res)
    case <-time.After(time.Second * 1):
        fmt.Println("timeout 1")
    }
}
```

其实它利用的是`time.After`方法，它返回一个类型为`<-chan Time`的单向的channel，在指定的时间发送一个当前时间给返回的channel中。

### Timer和Ticker
timer是一个定时器，代表未来的一个单一事件，你可以告诉timer你要等待多长时间，它提供一个Channel，在将来的那个时间那个Channel提供了一个时间值。下面的例子中第二行会阻塞2秒钟左右的时间，直到时间到了才会继续执行。

当然如果你只是想单纯的等待的话，可以使用`time.Sleep`来实现。

你还可以使用`timer.Stop`来停止计时器。

`ticker`是一个定时触发的计时器，它会以一个间隔(interval)往Channel发送一个事件(当前时间)，而Channel的接收者可以以固定的时间间隔从Channel中读取事件。下面的例子中ticker每500毫秒触发一次，你可以观察输出的时间。

类似timer, ticker也可以通过`Stop`方法来停止。一旦它停止，接收者不再会从channel中接收数据了。
