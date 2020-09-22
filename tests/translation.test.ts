import {baidu, google, youdao} from '../src';
import {expect} from 'chai';
import 'mocha';

const [from, to, text] = ['zh-CN', 'en', '而迎春花，茶花，吊兰等花，要进行换盆。'];

describe('translation', () => {
    describe('translate', () => {
        it('successfully by youdao', ()=>{
            return youdao.translate({from: from, to: to, text: text}).then((result)=>{
                expect(result.result ? result.result[0] : '').equal('And flower of winter jasmine, camellia, condole orchid, want to undertake changing a basin.')
            });
        });
    });
});