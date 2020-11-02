/**
 * @name 九桃小说 书源
 * @description 搜索/详情/目录/内容
 * @usage GET api/path?id=key
 */

const cheerio = require('cheerio')
const qs = require('query-string')
const iconv = require('iconv-lite')
const sourceUrl = 'https://www.9txs.com'
const searchUrl = 'https://www.9txs.com/search.html'

// 默认入口
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

// 解析请求参数
async function handleRequest (request) {
  if (request.method === "GET") {
    const match = /.+\/(.+)\?(.+)/.exec(request.url)
    let path = match ? match[1] : 'error'
    let query = match ? qs.parse(match[2]) : {}
    let id = query.id || ''
    let data = { code: '9999' }
    switch (path) {
      case 'search':
        data = await search(id)
        break
      case 'getBook':
        data = await getBook(id)
        break
      case 'getChapters':
        data = await getChapters(id)
        break
      case 'getContent':
        data = await getContent(id)
        break
      default:
        data = { ...data, msg: '请求错误' }
        break
    }
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
  } else {
    return new Response(JSON.stringify({ msg: "拒绝访问" }), { headers: { "Content-Type": "application/json" } })
  }
}

// 搜索
async function search (id) {
  const $ = cheerio.load(await getDomWithFormData(searchUrl, { searchkey: id }))
  let books = []
  $('.library>li').each((i, el) => {
    let book = {
      name: $(el).find('.bookname').text(),
      author: $(el).find('.author').text(),
      intro: $(el).find('.intro').text(),
      bookUrl: $(el).find('.bookname').attr('href'),
      coverUrl: $(el).find('.bookimg>img').attr('src'),
    }
    books.push(book)
  })
  return { books, code: '0000' }
}

// 获取详情
async function getBook (id) {
  const $ = cheerio.load(await getDom(sourceUrl + id))
  let book = {
    name: $('.detail>h1').text(),
    author: $('.detail>p').eq(0).find('a').eq(0).text(),
    type: $('.detail>p').eq(0).find('a').eq(1).text(),
    intro: $('.content>.intro').text(),
    lastChapter: $('.detail>p').eq(3).find('a').text(),
    lastUpdate: $('.detail>p').eq(3).find('span').text(),
    coverUrl: $('.bookimg>img').attr('src'),
    chaptersUrl: $('.bookimg').attr('href'),
  }
  return { book, code: '0000' }
}

// 获取章节
async function getChapters (id) {
  const $ = cheerio.load(await getDom(sourceUrl + id))
  let chapters = []
  $('.read>dl').each((i, el) => {
    // 跳过第一次
    if (i === 0) return true
    $(el).find('dd>a').each((i, el) => {
      let chapter = {
        chapterName: $(el).text(),
        chapterUrl: $(el).attr('href')
      }
      chapters.push(chapter)
    })
  })
  return { chapters, code: '0000' }
}

// 获取内容
async function getContent (id) {
  const $ = cheerio.load(await getDom(sourceUrl + id))
  let content = []
  $('#content>p').each((i, el) => {
    if (i === 0) return true
    let p = $(el).text()
    content.push(p)
  })
  return { content, code: '0000' }
}

// Utils-获取页面html
async function getDom (url) {
  let response = await fetch(new Request(url))
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

// Utils-获取页面html(FormData)
async function getDomWithFormData (url, kv) {
  let myHeaders = new Headers()
  // myHeaders.append("Cookie", "__cfduid=redacted; __cfruid=metoo");
  let formData = new FormData()
  Object.keys(kv).forEach(key => {
    formData.append(key, kv[key])
  })
  const requestInit = {
    method: 'POST',
    headers: myHeaders,
    body: formData
  }
  let response = await fetch(new Request(url, requestInit))
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

