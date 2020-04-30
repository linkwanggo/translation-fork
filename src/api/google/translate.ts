import {
    StringOrTranslateOptions,
    TranslateOptions,
    TranslateResult
} from '../types'
import request from '../../utils/make-request'
import {getRoot} from './state'
import detect from './detect'
import getError, {ERROR_CODE} from '../../utils/error'

export default async function (options: StringOrTranslateOptions) {
    let {text, com = false, from = '', to = ''} =
        typeof options === 'string' ? {text: options} : options

    if (!from) {
        from = await detect(options)
    }
    if (!to) {
        to = from.startsWith('zh') ? 'en' : 'zh-CN'
    }

    return transformRaw(
        await request({
            url: getRoot(com) + '/translate_a/single',
            headers: {
                // TODO: 保证目标语种不受操作系统或浏览器的设置影响，直接设置成 zh-CN 仍然有问题，需要看一下 0.6.x 的代码
                'Accept-Language': 'zh-CN,zh;q=0.9,en-GB;q=0.8,en;q=0.7'
            },
            query: {
                client: 'gtx',
                sl: from,
                tl: to,
                dj: '1',
                ie: 'UTF-8',
                oe: 'UTF-8',
                /*
                 t: sentences
                 rm: sentences[1]
                 bd: dict
                 at: alternative_translations
                 ss: synsets
                 rw: related_words
                 ex: examples
                 ld: ld_result
                */
                dt: ['at', 'bd', 'ex', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
                q: text
            }
        }),
        {
            from,
            to,
            com,
            text
        }
    )
}

interface RawResult {
    src: string // 被查询的字符串的语种
    sentences: {
        orig: string // 被查询的字符串
        trans: string // 一般翻译结果
    }[] // 数组的最后一项是翻译结果的音标（例如如果翻译到中文那么就是拼音）

    dict?: {
        // 单词详细释义
        pos: string // 词性，例如名词、动词等
        terms: string[] // 此词性下的单词释义
        entry: object[] // 对每个词的详解
    }[]
}

function transformRaw(rawRes: RawResult, queryObj: TranslateOptions) {
    let {text, to} = queryObj
    const realFrom = rawRes.src || queryObj.from!

    const obj: TranslateResult = {
        text,
        from: realFrom,
        to: to!,
        raw: rawRes,
        link: `${getRoot(queryObj.com)}/#${realFrom}/${to}/${encodeURIComponent(
            text
        )}`
    }

    try {
        // 尝试获取详细释义
        obj.dict = rawRes.dict!.map(v => {
            return v.pos + '：' + (v.terms.slice(0, 3) || []).join(',')
        })
    } catch (e) {
    }

    try {
        // 尝试取得翻译结果
        const {sentences} = rawRes
        const filtered = sentences.filter((x) => x.hasOwnProperty('trans') && x.hasOwnProperty('orig'));
        obj.result = filtered.map(({trans}) => trans.trim())
    } catch (e) {
    }

    if (!obj.dict && !obj.result) {
        throw getError(ERROR_CODE.API_SERVER_ERROR)
    }

    return obj
}
