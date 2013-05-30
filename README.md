jvalidator
=======================

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

<table>
    <tr><td>名称</td><td>功能</td><td>参数</td></tr>
    <tr>
        <td>required</td><td>必须填写，如果字段还有其它验证器，则可以省略</td><td>无</td>
    </tr>
    <tr>
        <td>non-required</td><td>非必填</td><td>无</td>
    </tr>
    <tr>
        <td>match</td><td>与参数相同<br />如：match[1] 就是字段的值等于1<br />再如：match[@xxx] 就是字段的值等于[name=xxx]元素的值</td><td>普通值,引用值<br />(普通值为任意字符，引用值为 @xxx，即指代 [name=xxx]的元素，下同)</td>
    </tr>
    <tr>
        <td>contain</td><td>包含参数中的内容</td><td>普通值,引用值</td>
    </tr>
    <tr>
        <td>email</td><td>验证邮箱格式</td><td>无</td>
    </tr>
    <tr>
        <td>min_length</td><td>字段值的长度最小为参数设置<br />如：min_length[5]</td><td>数字</td>
    </tr>
    <tr>
        <td>max_length</td><td>字段值的长度最大为参数设置<br />如：max_length[5]</td><td>数字</td>
    </tr>
    <tr>
        <td>length</td><td>字段值的长度应等于参数设置<br />length[5]</td><td>数字</td>
    </tr>
    <tr>
        <td>greater_than</td><td>字段值的数字必须大于参数设置<br />greater_than[5]</td><td>数字,引用值</td>
    </tr>
    <tr>
        <td>less_than</td><td>字段值的数字必须小于参数设置<br />less_than[5]</td><td>数字,引用值</td>
    </tr>
    <tr>
        <td>equal</td><td>字段值的数字必须等于参数设置<br />equal[5]</td><td>数字,引用值</td>
    </tr>
    <tr>
        <td>alpha</td><td>字母</td><td>无</td>
    </tr>
    <tr>
        <td>alpha_numeric</td><td>字母和数字</td><td>无</td>
    </tr>
    <tr>
        <td>alpha_dash</td><td>字母，数字，下划线，连接符</td><td>无</td>
    </tr>
    <tr>
        <td>chs</td><td>中文</td><td>无</td>
    </tr>
    <tr>
        <td>chs_numeric</td><td>中文，数字</td><td>无</td>
    </tr>
    <tr>
        <td>chs_dash</td><td>中文，数字，下划线，连接符</td><td>无</td>
    </tr>
    <tr>
        <td>numeric</td><td>数字</td><td>无</td>
    </tr>
    <tr>
        <td>int</td><td>整数，包括负数</td><td>无</td>
    </tr>
    <tr>
        <td>decimal</td><td>浮点数</td><td>无</td>
    </tr>
    <tr>
        <td>idcard</td><td>15及18位身份证格式</td><td>无</td>
    </tr>
    <tr>
        <td>passport</td><td>护照</td><td>无</td>
    </tr>
    <tr>
        <td>ip</td><td>IP地址</td><td>无</td>
    </tr>
    <tr>
        <td>@(element)</td><td>引用验证器，使用上比较特殊。 <br />如：@city[北京]，即为验证 [name=city]的字段的值是否为北京。<br /> 或者 @city[@city2]，即验证 city 和 city2 两个字段是否一致 </td><td>普通值，引用值</td>
    </tr>
</table>


### 如何看 demo ###

将源码下载，解压后进入目录

    fekit install
    fekit min -f src/index.js -o demo/jvalidator.min.js

http://localhost/demo/index.html



### 编译源码 

jvalidator的规则解析器依赖了jison，需要修改的时候请重新执行

    jison src/RuleParser.jison -m js -o src/RuleParser.js 

