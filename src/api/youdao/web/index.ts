import invert from '../../../utils/invert'
import {
  TranslateOptions,
  TranslateResult,
  StringOrTranslateOptions
} from '../../types'
import { StringObject } from '../../../types'
import request from '../../../utils/make-request'
import getError, { ERROR_CODE } from '../../../utils/error'
import sign from './sign'

interface WebResult {
  errorCode: number
  translateResult: [
    {
      src: string
      tgt: string
    }[]
  ]
  smartResult?: {
    entries: string[]
    type: number
  }
  type: string
}

const standard2custom: StringObject = {
  en: 'en',
  ru: 'ru',
  pt: 'pt',
  es: 'es',
  'zh-CN': 'zh-CHS',
  ja: 'ja',
  ko: 'ko',
  fr: 'fr'
}

const custom2standard = invert(standard2custom)

const link = 'http://fanyi.youdao.com'
const translateAPI = link + '/translate_o?smartresult=dict&smartresult=rule'

// 有道跟百度一样，通过添加一个 Cookie 鉴别请求是否来自网页
const headers = IS_NODE
  ? { Referer: link, Cookie: 'OUTFOX_SEARCH_USER_ID=1327810919@10.168.8.64' }
  : undefined;

// @ts-ignore
export default async function(options: StringOrTranslateOptions) {
  let { text, from = '', to = '' } =
    typeof options === 'string' ? { text: options } : options

  text = text.slice(0, 5000)

  if (from) {
    from = standard2custom[from]
  } else {
    from = 'AUTO'
  }

  if (to) {
    to = standard2custom[to]
  } else {
    to = 'AUTO'
  }

  // 有道网页翻译的接口的语种与目标语种中必须有一个是中文，或者两个都是 AUTO
  if (
    !(
      (from === 'AUTO' && to === 'AUTO') ||
      (from === 'zh-CHS' || to === 'zh-CHS')
    )
  ) {
    throw getError(ERROR_CODE.UNSUPPORTED_LANG)
  }

  return transformRaw(
    await request({
      method: 'post',
      url: translateAPI,
      type: 'form',
      body: Object.assign(
        {
          i: text,
          from,
          to,
          smartresult: 'dict',
          doctype: 'json',
          version: '2.1',
          keyfrom: 'fanyi.web',
          // action: 'FY_BY_REALTIME',
            action: 'FY_BY_CLICKBUTTION',
          typoResult: 'false'
        },
        sign(text)
      ),
      headers
    }),
    text
  )
}

function transformRaw(body: WebResult, text: string) {
  if (body.errorCode !== 0) {
    throw getError(ERROR_CODE.API_SERVER_ERROR)
  }

  let [from, to] = body.type.split('2')
  from = custom2standard[from]
  to = custom2standard[to]

  const { smartResult } = body

  const result: TranslateResult = {
    raw: body,
    text,
    from,
    to,
    link: smartResult
      ? `https://dict.youdao.com/search?q=${encodeURIComponent(
          text
        )}&keyfrom=fanyi.smartResult`
      : `http://fanyi.youdao.com/translate?i=${encodeURIComponent(text)}`
  }

  if (smartResult) {
    try {
      result.dict = smartResult.entries.filter(s => s).map(s => s.trim())
    } catch (e) {}
  }

  try {
    result.result = body.translateResult[0].map(o => o.tgt.trim())
  } catch (e) {}

  return result
}
