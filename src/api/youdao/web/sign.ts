import md5 from '../../../utils/md5'

const client = 'fanyideskweb';
// const sk = "rY0D^0'nM0}g5Mm1z%1G4"
const sk = "p09@Bn{h02_BIEe]$P^nG";

/**
 * 有道翻译接口的签名算法
 * @param {string} text
 * @return {{client: string, salt: number, sign: string}}
 */
export default function (text: string) {
    const ts = "" + (new Date).getTime();
    const appVersion = "5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36";
    const salt = ts + parseInt(String(10 * Math.random()), 10)
    return {
        client,
        salt,
        ts: ts,
        bv: md5(appVersion),
        sign: md5(client + text + salt + sk)
    }
}
