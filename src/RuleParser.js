var PARSER = {};

function _tokenized( str ) {
    var s = [];
    for( var i = 0; i < str.length; i++ ) {
        var chr = str.charAt(i);
        switch( chr ) {
            case '(':
            case ')':
            case '!':
            case '&':
            case '|':
                s.push(chr);
                s.push('');
                break;
            default:
                s.length ? s[s.length-1] += chr : s.push(chr);
                break;
        }
    }
    return s;
}

var regName = /^(@?\w+)(\[.+\])?$/;

function _parse( tokens ) {
    var ast = [];
    var o = null;
    var token; 
    while( (token = tokens.shift() ) !== void 0 ) {
        if( !token ) {
            continue;
        }
        switch( token ) {
            case '(':
            case ')':
            case '!':
            case '&':
            case '|':
                ast.push(token);
                break;
            default: 
                var a = token.match( regName );
                if( !a ) continue;
                if( a[1].charAt(0) == '@' ) {
                    o = { name : '@' , elemName : a[1].replace('@','') };
                } else {
                    o = { name : a[1] };
                }
                if( !PARSER[o.name] ) {
                    throw "not found parser's name : " + o.name;
                }
                if( a[2] ) o.value = a[2].replace('[','').replace(']','');
                ast.push( o );
                o = null;
                break;
        }
    }
    return ast;
}

// 增加解析器
// *name* 解析器名称
// *options.argument* 带有参数，默认没有
exports.add = function( name , options ) {
    PARSER[name] = options || {};
    PARSER[name].name = name;
}

exports.parse = function( str ) {
    var tokens = _tokenized( str );
    var ast = _parse( tokens );
    return ast;
}