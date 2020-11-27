/**
 * @name ���С˵
 * @description ��֪�����������ȡ�鼮
 */

const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const sourceUrl = 'http://www.zxcs.me'

// Ĭ�����
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

// �����߼�
async function handleRequest (request) {
  const $ = cheerio.load(await getDom(sourceUrl))
  let randomEl = $('#randlog').html()
  let outHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>���С˵</title><style>    ul,ol,li {      list-style: none;    }    body {      font-size: 16px;    }    .box {      border: 1px #DDD dashed;      background: #FFF;    }    a {      color: #222;      text-decoration: none;    }    a:hover {      color: #C30    }</style></head><body><div class="box">'
  outHtml += randomEl
  outHtml += '<button onclick="location.reload();" style="margin-left: 40%;margin-top: 20px;">��һ��</button></div></body></html>'
  return new Response(outHtml, { headers: { "Content-Type": "text/html;charset=utf-8","Access-Control-Allow-Origin": "*" } })

  // let books = []
  // $('#randlog>li').each((i, el) => {
  //   $(el).find('a').each((i, el) => {
  //     let book = {
  //       name: $(el).text(),
  //       url: $(el).attr('href')
  //     }
  //     books.push(book)
  //   })
  // })
  // return new Response(JSON.stringify(books), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
}

// ��ȡҳ��html
async function getDom (url) {
  let requestNew = new Request(url)
  // ����PC��ҳ��
  requestNew.headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36")
  let response = await fetch(requestNew)
  //����ҳ��������ҳ��htmlԴ��
  const contentType = response.headers.get('Content-Type')
  let charset = 'utf-8'
  if (contentType) {
    const match = /.+charset=(.+)/.exec(contentType)
    if (match) {
      charset = match[1]
    }
  }
  return iconv.decode(Buffer.from(await response.arrayBuffer()), charset)
}