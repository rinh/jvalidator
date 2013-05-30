%lex

%%

"|"                   return '|';
"&"                   return '&';
"("                   return '(';
")"                   return ')';
"!"                   return '!'
"[".*?"]"             return 'ARGS';
"@"[a-zA-Z0-9_\-]+       return 'XNAME';
[a-zA-Z0-9_\-]+          return 'NAME';
<<EOF>>               return 'EOF';

/lex

%left '&' '|'
%left '!'

%start expressions

%% 

expressions
    : e EOF   { return flatten($1);  }
    ;

e
    : '(' e ')'             {  $$ = [ '(' , $2 , ')' ];  }
    | e '|' e               {  $$ = [ $1 , '||' , $3 ]; }
    | e '&' e               {  $$ = [ $1 , '&&' , $3 ]; }
    | '!' e                 {  $$ = [ '!' , $2 ];  }
    | XNAME ARGS
        { 
            $$ = [ { name : '@' , elemName : $1.slice(1) , value : $2.slice(0,$2.length-1).slice(1) } ]; 
        }

    | NAME ARGS
        {
            var p = PARSER[$1];
            if(!p) throw "not found pattern '" + $1 + "'. "
            if(!p.argument) throw "pattern '" + $1 + "' must has arguments."
            $$ = [ { name : $1 , value : $2.slice(0,$2.length-1).slice(1) } ];
        }

    | NAME 
        {
            var p = PARSER[$1];
            if(!p) throw "not found pattern '" + $1 + "'. "
            if(p.argument) throw "pattern '" + $1 + "' mustn't has arguments."
            $$ = [ { name : $1 } ];
        }
    ;

%%

function flatten( oArray ) {
    var retVal = [];
    for (var i=0;i<oArray.length;i++) {
        if (!isArray( oArray[i]) ) {
            retVal.push( oArray[i] );
        } else {
            var tempFlatt = flatten(oArray[i]);
            for (var j=0;j<tempFlatt.length;j++) {
                retVal.push( tempFlatt[j] );
            }
        }
    }
    return retVal;
}

function isArray( anElement ) {
  return (typeof anElement=="object" && anElement.constructor == Array);
}

var PARSER = {};

// 增加解析器
// *name* 解析器名称
// *options.argument* 带有参数，默认没有
exports.add = function( name , options ) {
    PARSER[name] = options || {};
    PARSER[name].name = name;
}

// 解析出的结果为
// > [ 
//      { name : 'xxx' } , 
//      '|'
//      { name : '@' , elemName : 'xxx' ,  value : 'xxx' } , 
//      '&'
//      { name : 'xxx' , value : 'xxx' } 
//    ]
exports.parse = function () { return RuleParser.parse.apply(RuleParser, arguments); }



