/**
 * @description booktxt 书源
 *
 */

const cheerio = require('cheerio')
const qs = require('query-string')
var iconv = require('iconv-lite')

const sourceUrl = 'https://www.booktxt.com'
const searchUrl = 'https://www.booktxt.com/search.php?q={{key}}'

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest (request) {
  if (request.method === "GET") {
    const match = /.+\/(.+)\?(.+)/.exec(request.url)
    let path = match[1]
    let query = qs.parse(match[2])

    let data = {
      code: '9999'
    }
    switch (path) {
      case 'search':
        data = await search(query)
        break
      case 'getChapters':
        data = await getChapters(query)
        break
      case 'getChapter':
        data = await getChapter(query)
        break
    }
    return new Response(
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      })
  } else {
    return new Response(JSON.stringify({ msg: "拒绝访问" }), { headers: { "Content-Type": "application/json" } })
  }
}

// 工具类-获取页面html代码
async function getDomText (url) {
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

// 搜索小说 q=搜索词
async function search (query) {
  // 中文关键字需要进行编码
  let searchKey = encodeURIComponent(query.q)
  let url = searchUrl.replace('{{key}}', searchKey)
  const $ = cheerio.load(await getDomText(url))
  let books = []
  $('.result-item.result-game-item').each((i, el) => {
    let book = {
      name: $(el).find('.result-game-item-title-link').attr('title'),
      author: $(el).find('.result-game-item-info p.result-game-item-info-tag').eq(0).find('span').eq(1).text(),
      intro: $(el).find('p.result-game-item-desc').text(),
      bookUrl: $(el).find('.result-game-item-title-link').attr('href'),
      coverUrl: $(el).find('.result-game-item-pic-link-img').attr('src')
    }
    books.push(book)
  })
  return { books, code: '0000' }
}

// 获取小说章节列表 id=bookUrl
async function getChapters (query) {
  const $ = cheerio.load(await getDomText(sourceUrl + query.id))
  let chapters = []
  $('#list dl dd a').each((i, el) => {
    let chapter = {
      chapterName: $(el).text(),
      chapterUrl: $(el).attr('href')
    }
    chapters.push(chapter)
  })
  return { chapters, code: '0000' }
}

// 获取小说章节 id=chapterUrl
async function getChapter (query) {
  const $ = cheerio.load(await getDomText(sourceUrl + query.id))
  let chapter = $('#content').html()
  let ps = chapter.replace(/(&nbsp;)+/g,'').replace(/(<br>)+/g,'lalalawojiushiheimaojingzhang').split("lalalawojiushiheimaojingzhang")
  return { ps, code: '0000' }
}
