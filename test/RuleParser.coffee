assert = module.parent.require('chai').assert
parser = require('../src/RuleParser')

parser.add 'required' 
parser.add '@' , {  argument : true  }
parser.add 'match' , {  argument : true  }

describe 'parser', ->
    it '#parse is right' , () ->

        assert.throw () ->
            parser.parse('abc')

        assert.equal parser.parse('required')[0].name , 'required'
        assert.equal parser.parse('required&required')[0].name , 'required'
        assert.equal parser.parse('required&required|required')[4].name , 'required'

        assert.equal parser.parse('@aaa[111]')[0].name , '@'
        assert.equal parser.parse('@aaa[111]')[0].value , '111'
        assert.equal parser.parse('@aaa[111]')[0].elemName , 'aaa'

        assert.equal parser.parse('match[111]')[0].name , 'match'
        assert.equal parser.parse('match[111]')[0].value , '111'

        a = parser.parse('!required&(!@aaa[xxx@x x]|match[@bbb])')
        assert.equal a[1].name , 'required'
        assert.equal a[5].name , '@'
        assert.equal a[5].elemName , 'aaa'
        assert.equal a[5].value , 'xxx@x x'
        assert.equal a[7].name , 'match'
        assert.equal a[7].value , '@bbb'

