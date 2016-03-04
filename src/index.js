var test;
var v = require('./Validator.js');

var validFunc = {
    
    /***
     * 值:
     * 1 无错误 
     * -1 长度错误
     * -2 验证错误 
     */
    ID : function( num ) {  

        num = num.toUpperCase();  
        
        //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。   
        if (!(/(^\d{15}$)|(^\d{17}(\d|X)$)/.test(num))) { 
            return -1; 
        }
        
        //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。 
        //下面分别分析出生日期和校验位 
        
        var len, re; 
        len = num.length; 
        if (len == 15) {
            
            re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/); 
            var arrSplit = num.match(re); 

            //检查生日日期是否正确 
            var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]); 
            var bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4])); 
            
            if (!bGoodDay) { 
                return -2; 
            } else {                
                return 1;
            }   
        }
        
        if (len == 18) {
            
            re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})(\d|X)$/); 
            var arrSplit = num.match(re); 

            //检查生日日期是否正确 
            var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]); 
            var bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4])); 

            if (!bGoodDay) { 
                return -2; 
            } else { 
                //检验18位身份证的校验码是否正确。 
                //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。 
                var valnum; 
                var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2); 
                var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'); 
                var nTemp = 0, i; 
                for(i = 0; i < 17; i ++) { 
                    nTemp += num.substr(i, 1) * arrInt[i]; 
                } 
                
                valnum = arrCh[nTemp % 11];
                
                if (valnum != num.substr(17, 1)) { 
                    return -2; 
                } 
                
                return 1; 
            } 
        }
        
        return -2; 
        
    }
    
};

v.addPattern('required',{
    message : '必须填写' , 
    validate : function( value , done ) {
        done( value !== "" ); 
    }
});

v.addPattern('non-required',{
    message : '允许为空' , 
    validate : function( value , done ) {
        done( value === "" ); 
    }
});

v.addPattern('numeric',{
    message : '必须是数字' , 
    validate : function( value , done ) {
        done( /^\d+$/.test( value ) );
    }
});


v.addPattern('int',{
    message : '必须是整数' , 
    validate : function( value , done ) {
        done( /^\-?\d+$/.test( value ) );
    }
});

v.addPattern('decimal',{
    message : '必须是小数' , 
    validate : function( value , done ) {
        done( /^\-?\d*\.?\d+$/.test( value ) );
    }
});


v.addPattern('alpha',{
    message : '必须是字母' , 
    validate : function( value , done ) {
        done( /^[a-z]+$/i.test( value ) );
    }
});

v.addPattern('alpha_numeric',{
    message : '必须为字母或数字' , 
    validate : function( value , done ) {
        done( /^[a-z0-9]+$/i.test( value ) );
    }
});

v.addPattern('alpha_dash',{
    message : '必须为字母或数字及下划线等特殊字符' , 
    validate : function( value , done ) {
        done( /^[a-z0-9_\-]+$/i.test( value ) );
    }
});

v.addPattern('chs',{
    message : '必须是中文字符',
    validate : function( value , done ) {
        done( /^[\\u4E00-\\u9FFF]+$/i.test( value ) );
    }
});

v.addPattern('chs_numeric',{
    message : '必须是中文字符或数字',
    validate : function( value , done ) {
        done( /^[\\u4E00-\\u9FFF0-9]+$/i.test( value ) );
    }
});

v.addPattern('chs_numeric',{
    message : '必须是中文字符或数字及下划线等特殊字符' , 
    validate : function( value , done ) {
        done( /^[\\u4E00-\\u9FFF0-9_\-]+$/i.test( value ) );
    }
});


v.addPattern('match',{
    argument : true , 
    message : '必须与 %argu 相同' , 
    validate : function( value , done ) {
        var v = this.getValueSymbol();
        var vv = v && v.tagName ? this.getElementValue(v) : v;
        done( vv === value );
    }
});

v.addPattern('contain',{
    argument : true , 
    message : '必须包含"%argu"的内容' , 
    validate : function( value , done ) {
        var v = this.getValueSymbol();
        var vv = v && v.tagName ? this.getElementValue(v) : v;
        done( !!~value.indexOf(vv) );
    }
});


v.addPattern('@',{
    argument : true , 
    message : '@@必须为 %argu' , 
    validate : function( value , done ) {
        var v = this.getValueSymbol();
        var at = this.getNameSymbol();
        if( v === null || at === null ) {
            done( false );
        } else {
            var vv = v && v.tagName ? this.getElementValue(v) : v;
            var vat = at && at.tagName ? this.getElementValue(at) : at;
            done( vv === vat );
        }
        
    }
});


v.addPattern('idcard',{
    message : '身份证格式错误' , 
    validate : function( value , done ) {
        done( validFunc.ID(value) === 1 ); 
    }
});


v.addPattern('passport',{
    message : '护照格式错误或过长',
    validate : function( value , done ) {
        done( /^[a-zA-Z0-9]{0,20}$/i.test( value ) ); 
    }
});

v.addPattern('email',{
    message : '邮件地址错误',
    validate : function( value , done ) {
        done( /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/.test( value ) );
    }
});

v.addPattern('min_length',{
    argument : true , 
    message : '最少输入%argu个字', 
    validate : function( value , done ) {
        var n = parseInt( this.value , 10 );
        done( value.length >= n );
    }
});

v.addPattern('max_length',{
    argument : true , 
    message : '最多输入%argu个字', 
    validate : function( value , done ) {
        var n = parseInt( this.value , 10 );
        done( value.length <= n );
    }
});


v.addPattern('length',{
    argument : true , 
    message : '长度必须为%argu个字符', 
    validate : function( value , done ) {
        var n = parseInt( this.value , 10 );
        done( value.length === n );
    }
});


v.addPattern('greater_than',{
    argument : true , 
    message : '必须大于%argu',
    validate : function( value , done ){
        var v = parseInt( value , 10 );
        var n = this.parseNameSymbol( this.value );
        n = parseFloat( n && n.tagName ? this.getElementValue( n ) : this.value );
        done( v > n )
    }
});

v.addPattern('less_than',{
    argument : true , 
    message : '必须小于%argu',
    validate : function( value , done ){
        var v = parseInt( value , 10 );
        var n = this.parseNameSymbol( this.value );
        n = parseFloat( n && n.tagName ? this.getElementValue( n ) : this.value );
        done( v < n )
    }
});

v.addPattern('equal',{
    argument : true , 
    message : '必须等于%argu',
    validate : function( value , done ){
        var v = parseInt( value , 10 );
        var n = this.parseNameSymbol( this.value );
        n = parseFloat( n && n.tagName ? this.getElementValue( n ) : this.value );
        done( v == n )
    }
});

v.addPattern('ip',{ 
    message : '必须符合ip格式',
    validate : function( value , done ){
        done( /^((25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})\.){3}(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})$/i.test(value) );
    }
});

v.addPattern('date',{
    message : '必须符合日期格式 YYYY-MM-DD',
    validate : function( value , done ) {
        done( /^\d\d\d\d\-\d\d\-\d\d$/.test(value) );
    }
});
 