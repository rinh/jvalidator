jvalidator
=======================

### Change Log ###
0.3.0 去除jquery依赖
0.3.3 简化 parser， 不再使用 jison


### 基本使用 ###

##### 第1步

设置好表单,为需要验证的字段设置 data-jvalidator-pattern ，该内容是你可以使用的验证器
    
    <form id="form1">
        <input name="name" data-jvalidator-pattern="required" />
    </form>

##### 第2步 #####

写 javascript 代码

    var jv = $("#form1").jvalidator();
    jv.validateAll(function( result , elements ){
        alert( result ? '验证成功' : '验证失败' );
    });

恭喜，你已经完成表单的基本验证功能。

* 针对表单使用
* 为需要验证的元素加上 data-jvalidator-pattern 
* 即可整个表单验证，也可以单独触发某个字段的验证

##### 你可以使用的验证器 #####

关于参数的值：(普通值为任意字符，引用值为 @xxx，即指代 [name=xxx]的元素，下同)


- **required** 无参数 

    必须填写，如果字段还有其它验证器，则可以省略

- **non-required** 无 

    非必填

- **match** 普通值,引用值

    与参数相同
    如：match[1] 就是字段的值等于1
    再如：match[@xxx] 就是字段的值等于[name=xxx]元素的值

- **contain** 普通值,引用值

    包含参数中的内容

- **email** 无

    验证邮箱格式

- **min_length** 数字

    字段值的长度最小为参数设置
    如：min_length[5]

- **max_length** 数字

    字段值的长度最大为参数设置
    如：max_length[5]

- **length** 数字

    字段值的长度应等于参数设置
    如：length[5]

- **greater_than** 数字,引用值

    字段值的数字必须大于参数设置
    如：greater_than[5]

- **less_than** 数字,引用值

    字段值的数字必须小于参数设置
    如：less_than[5]

- **equal** 数字,引用值

    字段值的数字必须等于参数设置
    如：equal[5]

- **alpha** 无

    字母

- **alpha_numeric** 无

    字母和数字

- **alpha_dash** 无

    字母，数字，下划线，连接符

- **chs** 无

    中文

- **chs_numeric** 无

    中文，数字

- **chs_dash** 无

    中文，数字，下划线，连接符

- **numeric** 无

    数字

- **int** 无

    整数，包括负数

- **decimal** 无

    浮点数

- **idcard** 无

    15及18位身份证格式

- **passport** 无

    护照

- **ip** 无

    IP地址

- **@(element)** 普通值，引用

    引用验证器，使用上比较特殊。 
    如：@city[北京]，即为验证 [name=city]的字段的值是否为北京。
    或者 @city[@city2]，即验证 city 和 city2 两个字段是否一致 



### 如何看 demo ###

http://gist.corp.qunar.com/hao.lin/jvalidator/demo/index.html

或

将源码下载，解压后进入目录

    fekit install
    fekit min -f src/index.js -o demo/jvalidator.min.js

直接查看 demo/index.html



### 编译源码 

jvalidator的规则解析器依赖了jison，需要修改的时候请重新执行

    jison src/RuleParser.jison -m js -o src/RuleParser.js 

