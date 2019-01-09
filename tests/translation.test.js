let {baidu, google, youdao} = require('../dist/tjs.node.common');
let expect = require('chai').expect;

const [from, to, text] = ['zh-CN', 'en', '而迎春花，茶花，吊兰等花，要进行换盆。'];

describe('Translation', () => {
    describe('Translate', () => {
        // 有道翻译接口
        it('youdao can return right result', () => {
            return youdao.translate({from: from, to: to, text: text}).then((result)=>{
                expect(result.result[0]).equal('And flower of winter jasmine, camellia, condole orchid, want to undertake changing a basin.')
            });
        });
        // google 翻译接口
        it('google can return right result', () => {
            return google.translate({from: from, to: to, text: text}).then((result)=>{
                expect(result.result[0]).equal('The flowers of the spring, the camellia, the spider plant, etc., need to be changed.')
            });
        });
        // 百度翻译接口
        it('baidu can return right result', () => {
            return baidu.translate({from: from, to: to, text: text}).then((result) => {
                expect(result.result[0]).equal('And the spring flowers, camellias, orchids and other flowers, to change pots.')
            });
        });
    });
});