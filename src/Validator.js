var Async = require('./AsyncRequest.js');
var parser = require('./RuleParser.js');

var PATTERNS = {}
var CONSTANT = {
    PATTERN : "jvalidator-pattern" , 
    PLACEHOLDER : "jvalidator-placeholder" , 
    CNAME : "jvalidator-cname" , 
    MESSAGE_ATTR : "__jvalidator_messages__" , 
    FIELD_EVENTS : "__jvalidator_events__" , 
    DEBUG : "jvalidator-debug"
}

// ## 字段检查器
// 绑定到某个字段后，对其进行检查等操作
function FieldChecker( element ) {
    this.element = element;
    this.$element = $(element);
    this.$form = this.$element.closest('form');
    this.async = new Async();
}

FieldChecker.prototype = {

    _getPatternMessage : function( results ) {  
        var rstr = [];
        for( var i = 0; i < results.length; i++ ) {
            var p = results[i];
            if( p.name ) {
                rstr.push( p.getMessage() );
            } else {
                switch( p ) {
                    case '&&':
                        rstr.push(' 并且 ');
                        break;
                    case '||':
                        rstr.push(' 或者 ');
                        break;
                    case '!':
                        rstr.push('不');
                        break;
                }
            }
        }
        return rstr.join('');
    } ,

    // 检查生成结果并返回错误信息
    // return errors
    _checkPatternResult : function( str , results ) {
        var self = this;
        var rstr = [];
        for( var i = 0; i < results.length; i++ ) {
            var p = results[i];
            if( p.name ) {
                rstr.push( p.result );
            } else {
                rstr.push( p );
            }
        }

        if( this.$form.data(CONSTANT.DEBUG) ) {
            console.info( this , this.element , str , rstr.join('') )
        }

        var all = eval( rstr.join('') );
        if( all ) {
            return [];
        } else {
            var arr = $.grep( results , function( e , idx ){
                return e.name && e.result === false;
            });
            arr.getMessage = function(){
                return self._getPatternMessage( results );
            }
            return arr;
        }
    },

    // 验证自身的 pattern 是否合法以及是否满足所有项，以供开发自测使用
    checkPattern : function(){
        var $e = this.$element;
        var rule_str = $e.data( CONSTANT.PATTERN );
        try {
            var patterns = parser.parse( rule_str );
        } catch(e) {
            console.error( this.element , '验证器语法有错误，请检查' , rule_str );
            console.error( '错误可能是：' , e );
        }
    } ,

    // * done *
    //  可以不传，即为触发检查 
    //  `checkResult` boolean 检查结果 
    //  `evt` 为触发的事件，可以没有
    //  `errors` array 错误信息
    check : function( $event , checkCallback ) {

        var self = this;
        var async = this.async;
        var e = this.element;
        var $e = this.$element;
        var value = this.value();
        var rule_str = $e.data( CONSTANT.PATTERN );
        var patterns = parser.parse( rule_str );

        async.clear();
        async.onfinished = function(){
            var errors = self._checkPatternResult( rule_str , patterns );
            if ( checkCallback ) { checkCallback( errors.length == 0 , errors ); }
            self.after_check( errors.length == 0 , errors , $event );
        };

        $.each( patterns , function(){
            // 跳过所有计算变量
            if( !this.name ) return;

            // p 其中包括
            // argument - 可能有
            // message - 原始的message设置 
            // validate - 验证规则 
            // rule_str解析出来的内容 name(同patternName) , elemName(@才会有) , value(pattern的属性值)
            // element - 对应的 element
            // result - 验证后，会对该项设置 true 或 false
            var p = $.extend( this , {
                element : self.element ,
                $element : self.$element , 
                $form : self.$form , 
                getMessage : function(){
                    return self._getMessage.call( this , value );
                } , 
                // 用来解析 parsedstr(它是带有@的内容) 的值，解析成功就返回那个 element ，否则返回 null
                parseNameSymbol : function( parsedstr ){
                    if( parsedstr.charAt(0) !== '@' ) return null;
                    return this.$form.find( _parse_selector_syntax( parsedstr ) )[0];
                } , 

                // 当 pattern 是 @xx[xx] 时， 则可以通过该方法取得 @ 对应的元素
                getNameSymbol : function(){
                    return this.parseNameSymbol( '@' + this.elemName );
                },

                // 当 pattern 是 xx[xx] 时， 则可以通过该方法取得括号中的值
                // 如果值为 @xxx , 则返回该元素
                // 否则返回值
                getValueSymbol : function(){
                    var el = this.parseNameSymbol( this.value );
                    return el ? el : this.value;
                } , 

                getElementValue : function( el ){
                    el = $(el)[0]
                    if( !el ) return "";
                    var jv = _getFieldValidator( el )
                    return jv ? jv.value() : self.value.call({
                        element : el , 
                        $element : $(el) , 
                        $form : self.$form
                    });
                } , 

                // 得到元素的 cname 或 name
                getElementName : function ( el ) {
                    var $el = $(el);
                    if( $el.data( CONSTANT.CNAME ) ) {
                        return $el.data( CONSTANT.CNAME )
                    } else {
                        return $el.attr('name');    
                    }
                    return "";
                }

            } , PATTERNS[ this.name ] );

            (function(p){ async.addRequest(function( async_continue ){
                // isvalid - 是否验证成功
                p.validate( value , function( is_valid ){
                    p.result = is_valid;
                    async_continue();
                })

            }); })(p);
        })

        async.go();

    } , 

    // 根据 patternName 得到错误信息
    // 优先级为：字段的message设置 > pg的message设置 > pattern的标准设置 
    // * value * 为值，如果不传则重新获取
    // * 由 p 进行调用
    _getMessage : function( value ) {

        var self = this;
        var patternName = this.name;
        var e = this.element;
        var $e = this.$element;
        var $f = this.$form;
        var v = value || _getFieldValidator(e).value();
        var msg_tmpl = ( e[ CONSTANT.MESSAGE_ATTR ] ? e[ CONSTANT.MESSAGE_ATTR ][ patternName ] : null )
                       || ( $f[0][ CONSTANT.MESSAGE_ATTR ] ? $f[0][ CONSTANT.MESSAGE_ATTR ][ patternName ] : null )
                       || ( PATTERNS[ patternName ].message );

        msg_tmpl = msg_tmpl.replace( /%val\b/g , v ) 
        msg_tmpl = msg_tmpl.replace( /%name\b/g , e.name )
        msg_tmpl = msg_tmpl.replace( /%cname\b/g , $e.data( CONSTANT.CNAME) ) 
        msg_tmpl = msg_tmpl.replace( /=%argu\b/g , function(){
                            var v = self.parseNameSymbol( self.value );
                            return v && v.tagName ? self.getElementValue( v ) : self.value;
                       })
        msg_tmpl = msg_tmpl.replace( /%argu\b/g , function(){
                            var v = self.parseNameSymbol( self.value );
                            return v && v.tagName ? self.getElementName( v ) : self.value;
                       })
        msg_tmpl = msg_tmpl.replace( /@@/g , function( $0 , $1 ){
                            var el = $f.find( _parse_selector_syntax("@" + self.elemName) )[0]
                            if( !el ) {
                                return "";
                            } else {
                                var $el = $(el);
                                if( $el.data( CONSTANT.CNAME ) ) {
                                    return $el.data( CONSTANT.CNAME )
                                } else {
                                    return $el.attr('name');    
                                }
                            }
                       })
        msg_tmpl = msg_tmpl.replace( /=@([^\s]*)\b/g , function( $0 , $1 ){
                            return self.getElementValue( $f.find('[name=' + $1 + ']') )
                       })
        msg_tmpl = msg_tmpl.replace( /@([^\s]*)\b/g , function( $0 , $1 ){
                            return self.getElementName( $f.find('[name=' + $1 + ']') ) || "" ;
                       })
        return msg_tmpl;

    },

    // 根据不同的字段类型，取得 element 的值
    value : function() {
        var e = this.element , $e = this.$element , $form = this.$form , placeholdertext ;
        switch( e.tagName.toLowerCase() ) {
            case 'input':
                switch( e.type ) {
                    case 'radio':
                        return $form.find('input[name=' + e.name + ']:radio:checked').val()
                    case 'checkbox':
                        return $form.find('input[name=' + e.name + ']:checkbox:checked').map(function(){
                            return this.value;
                        }).toArray().join(',');
                    case 'text':
                        placeholdertext = $e.data( CONSTANT.PLACEHOLDER );
                        return placeholdertext === e.value ? "" : e.value;
                    case 'hidden':
                    case 'password':
                        return e.value;
                }
                break;
            case 'select':
                return e.value;
            case 'textarea':
                placeholdertext = $e.data( CONSTANT.PLACEHOLDER );
                return placeholdertext === e.value ? "" : e.value;
        }
    } , 

    // 触发自验证行为
    after_check : function( is_valid , errors , $event ) {
        var type = is_valid ? 'success' : 'fail';
        var evt = this.$element.data( CONSTANT.FIELD_EVENTS + type );
        if( !evt ) evt = this.$form.data( CONSTANT.FIELD_EVENTS + type );
        if( !evt || typeof evt != 'function') return;

        evt.call( this , $event , errors );
    }

};


// ## 表单验证器

function FormValidator( form ) {
    if( !form ) throw "[ERROR] form 参数必须存在."
    if( form.tagName !== 'FORM' ) throw "[ERROR] 参数 form 必须是个表单元素."
    this.form = form;
    this.$form = $(form);
    this.async = new Async();
}

// 判断元素可见并存在
function _exists( el ){
    return $(el).closest('body').size() > 0 && $(el).is(":visible");
}

// 得到指定元素的jvalidator
function _getFieldValidator( el ){
    if( !$(el).data( CONSTANT.PATTERN ) ) return;
    return el._field_validator ? el._field_validator : ( el._field_validator = new FieldChecker( el ) );
}

// 解析 when 中的支持 @name 的 selector 语法 
function _parse_selector_syntax( selector ) {
    return ( selector || "" ).replace(/@([a-z][a-z0-9]*)\b/ig,'[name=$1]');
}

FormValidator.prototype = {

    // 得到所有需要验证的字段（非隐藏且不为disabled）
    _getAllFieldValidator : function() {
        var self = this;
        return this.$form.find('[data-' + CONSTANT.PATTERN + ']').filter(function(){
            return _exists(this) && !this.disabled;
        }).map(function(){
            return _getFieldValidator(this);
        }).toArray();
    } ,

    // 验证本表单中所有元素的 pattern 是否正确
    checkAllPatterns : function(){
        var _jvs = this._getAllFieldValidator();
        $.each( _jvs , function(){
            this.checkPattern();
        });
    } ,

    // 验证表单内所有字段
    validateAll : function( validateAllCallback ){
        var $form = this.$form;
        var async = this.async;
        var _jvs = this._getAllFieldValidator();
        var errors = [];

        async.clear();
        async.onfinished = function(){
            validateAllCallback && validateAllCallback( errors.length == 0 , errors ); 
        }

        // 当没有任何可以验证的字段时直接返回
        if( !_jvs.length ) {
            return validateAllCallback( true , [] );
        }

        for( var i = 0; i < _jvs.length; i++ ) {
            var jv = _jvs[i];
            
            (function(jv){
                async.addRequest(function(async_continue){
                    jv.check( null , function( checkResult , error ){
                        if( !checkResult ){ errors.push( error ) }
                        async_continue();
                    });
                });
            })(jv);

        }

        async.go();
    } , 

    // 当你需要字段自触发验证时，比如：input blur时需要验证，请使用该方法.
    // selector 是需要自触发验证的字段 - 如果不写则默认全部。<br />
    // evts 有两种写法:
    // ##### 第一种：
    // > [ 'blur' , 'focus' , 'keypress' ] 
    // 
    // 代表 selector 的 [ 'blur' , 'focus' , 'keypress' ] 事件会触发 selector 的验证
    // 
    // ##### 第二种：
    // > \{ <br />
    // >     '@sel' : [ 'blur' , 'keypress' ]
    // > \} <br />
    // 
    // 代表 由@sel 的 [ 'blur' , 'keypress' ] 事件会触发 selector 的验证

    when : function( selector , evts ) {
        if( typeof selector != 'string' ) {
            evts = selector;
            selector = "";
        }

        var events = {};
        var sel = selector || "[data-" + CONSTANT.PATTERN + "]";
        if( $.isArray(evts) ) {  
            events[ sel ] = evts ;
        } else if( $.isPlainObject(evts) ) {
            $.extend( events , evts );
        }

        // 处理 checkbox 和 radio
        var chks = this.$form.find(sel).find('input:checkbox');
        if( chks.length ) {
            chks.each(function(){
                sel += "," + _parse_selector_syntax( "@" + this.name )
            });
        }

        var rdos = this.$form.find(sel).find('input:radio');
        if( rdos.length ) {
            rdos.each(function(){
                sel += "," + _parse_selector_syntax( "@" + this.name )
            });
        }

        for( var targetSelector in events ) {
            var _sel = _parse_selector_syntax( targetSelector );
            var _evts = ( events[targetSelector] || [] );
            if( !_evts.length ) continue;
            _evts = _evts.join(' ');

            this.$form.undelegate( _sel , _evts );

            this.$form.delegate( _sel , _evts , function($event){
                var jv = _getFieldValidator( this );
                jv && jv.check( $event );
            })
        }

    },

    setMessage : function( selector , patternName , msg ) { 

        if( arguments.length == 2 ) {
            msg = patternName;
            patternName = selector;
            selector = null;
        }

        var c , f = this.$form[0];

        if( !selector ) {
            c = f[ CONSTANT.MESSAGE_ATTR ] = f[ CONSTANT.MESSAGE_ATTR ] || {};
            c[patternName] = msg;
        } else {
            this.$form.find( _parse_selector_syntax( selector ) ).each(function(){
                var e = this;
                c = e[ CONSTANT.MESSAGE_ATTR ] = e[ CONSTANT.MESSAGE_ATTR ] || {};
                c[patternName] = msg;
            });
        }

    } ,

    success : function( selector , fn ) {
        this._bind_field_event( 'success' , selector , fn );
    } ,

    fail : function( selector , fn ) {
        this._bind_field_event( 'fail' , selector , fn );
    } ,

    _bind_field_event : function( type , selector , fn ) {
        
        if( !type ) return;

        if( typeof selector == 'function' ) {
            fn = selector;
            selector = null;
        }

        if( selector ) {
            var sel = _parse_selector_syntax( selector );
            this.$form.find(sel).each(function(){
                $(this).data( CONSTANT.FIELD_EVENTS + type , fn );
            })
        } else {
            this.$form.data( CONSTANT.FIELD_EVENTS + type , fn );
        }

    }

}

$.fn.jvalidator = function(){
    var form = $(this).first();
    if( form.data('FormValidator') ) return form.data('FormValidator');
    var fv = new FormValidator( form[0] );
    form.data('FormValidator', fv );
    return fv;
};


// 设置增加自定义 pattern 的入口

function addPattern( name , options ) {

    if(!name) throw "[ERROR] add pattern - no name";
    if(!options) throw "[ERROR] add pattern - no options"
    if(!options.message) throw "[ERROR] add pattern - no message"
    if(!options.validate) throw "[ERROR] add pattern - no validate";
    
    PATTERNS[name] = $.extend({
        name : name 
    } , options );

    parser.add( name , options );

}

exports.addPattern = addPattern;

$.extend({
    jvalidator: {
        addPattern : addPattern
    }
});
