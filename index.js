/**
 * @name 九桃小说 书源
 * @description 搜索/详情/目录/内容
 * @usage GET api/path?id=key
 */

const cheerio = require('cheerio')
const qs = require('query-string')
const iconv = require('iconv-lite')
const sourceUrl = 'https://www.9txs.org'
const searchUrl = 'https://so.9txs.org/www/'
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
}
const TOKEN_EXPIRE = 600 // token时长（秒）
// 默认入口
addEventListener("fetch", event => {
  const request = event.request
  if (request.method === "OPTIONS") {
    // Handle CORS preflight requests
    event.respondWith(handleOptions(request))
  }
  else if (
    request.method === "GET" ||
    request.method === "HEAD" ||
    request.method === "POST"
  ) {
    // Handle requests to the API server
    event.respondWith(handleRequest(request))
  }
  else {
    event.respondWith(
      new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      }),
    )
  }


})

// 处理OPTIONS请求
function handleOptions (request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS pre-flight request
    let respHeaders = {
      ...corsHeaders,
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers")
    }
    return new Response(null, {
      headers: respHeaders,
    })
  }
  else {
    // Handle standard OPTIONS request
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    })
  }
}

// 处理实际请求
async function handleRequest (request) {
  let data = { code: '9999' }
  if (request.method === "GET") {
    const match = /.+\/(.+)\?(.+)/.exec(request.url)
    let path = match ? match[1] : 'error'
    let query = match ? qs.parse(match[2]) : {}
    let id = query.id || ''

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
  } else if (request.method === "POST") {
    const match = /.+\/(.+)/.exec(request.url)
    let path = match ? match[1] : 'error'
    const params = await request.json()
    switch (path) {
      case 'register':
        data = await register(params)
        break
      case 'login':
        data = await login(params)
        break
      case 'getUserData':
        data = await getUserData(params)
        break
      case 'updateUserData':
        data = await updateUserData(params)
        break
      case 'addBook':
        data = await addBook(params)
        break
      default:
        data = { ...data, msg: '请求错误' }
        break
    }
  } else {
    data.msg = "拒绝访问"
  }

  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
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
    books.reverse()
  })
  return { books, code: '0000' }
}

// 获取详情
async function getBook (id) {
  const $ = cheerio.load(await getDom(id))
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

// 注册
async function register (params) {
  const { id, password } = params
  try {
    let users = await KV.get('users')
    if (users) {
      users = JSON.parse(users)
    } else {
      users = []
    }
    if (users.find(el => el.id === id)) {
      return { msg: 'this id has exist!', code: '0001' }
    } else {
      users.push({ id, password, data: {} })
      await KV.put('users', JSON.stringify(users))
      return { msg: 'register success!', code: '0000' }
    }
  } catch (error) {
    console.log(error.message)
    return { msg: 'register failed!', code: '9999' }
  }
}

// 登录
async function login (params) {
  const { id, password } = params
  try {
    const users = await KV.get('users', { type: 'json' })

    if (users.find(el => el.id === id && el.password === password)) {
      let token = 'token-' + new Date().getTime().toString().slice(-6)
      token = token + Math.floor(Math.random() * 10000).toString()
      // expirationTtl token生效时长（秒）
      await KV.put(token, id, { expirationTtl: TOKEN_EXPIRE })
      return { token, code: '0000' }
    } else {
      return { msg: 'login failed!', code: '0001' }
    }
  } catch (error) {
    console.log(error.message)
    return { msg: 'somethings error!', code: '9999' }
  }
}

// 获取用户数据
async function getUserData (params) {
  const { token } = params
  try {
    const id = await KV.get(token)
    if (id) {
      const user = (await KV.get('users', { type: 'json' })).find(user => user.id === id)
      return { data: { ...user.data, id }, code: '0000' }
    } else {
      return { msg: 'token is valid!', code: '0001' }
    }
  } catch (error) {
    console.log(error.message)
    return { msg: 'somethings error!', code: '9999' }
  }
}

// 更新用户数据
async function updateUserData (params) {
  const { token, payload } = params
  try {
    const id = await KV.get(token)
    if (id) {
      const users = await KV.get('users', { type: 'json' })
      const index = users.findIndex(el => el.id === id)
      users[index].data = { ...users[index].data, ...payload }
      await KV.put('users', JSON.stringify(users))

      return { msg: '操作成功！', code: '0000' }
    } else {
      return { msg: 'token已过期！', code: '0001' }
    }
  } catch (error) {
    console.log(error.message)
    return { msg: 'somethings error!', code: '9999' }
  }
}

// 加入书架
async function addBook (params) {
  const { token, book } = params
  try {
    const id = await KV.get(token)
    if (id) {
      const users = await KV.get('users', { type: 'json' })
      const index = users.findIndex(el => el.id === id)
      users[index].data.books = users[index].data.books ? [...users[index].data.books, book] : [book]
      await KV.put('users', JSON.stringify(users))

      return { msg: '操作成功！', code: '0000' }
    } else {
      return { msg: 'token已过期！', code: '0001' }
    }
  } catch (error) {
    console.log(error.message)
    return { msg: 'somethings error!', code: '9999' }
  }
}
