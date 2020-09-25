/**
 * regexp for whitelisted origins
 * "^http.?://www.zibri.org$", "zibri.org$", "test\\..*" 
 */
const whitelist = [
  'https://zhb124404.github.io'
]

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest (request) {
  // https://cloudflare-worker-url/real-url
  const origin = request.headers.get('Origin')
  if (matchUrl(origin, whitelist)) {
    const url = new URL(request.url)
    let realUrl = request.url.substr(8)
    realUrl = realUrl.substr(realUrl.indexOf('/') + 1)
    // 解决中文参数乱码问题
    realUrl = encodeURI(decodeURIComponent(realUrl))

    request = new Request(realUrl, request)
    request.headers.set("Origin", new URL(realUrl).origin)

    let response = await fetch(request)
    response = new Response(response.body, response)
    response.headers.set("Access-Control-Allow-Origin", origin)
    return response
  } else {
    return new Response(
      "无权访问\n",
      {
        status: 403,
        statusText: 'Forbidden',
        headers: {
          "Content-Type": "text/html;charset=utf-8"
        }
      })
  }
}

// regexp match
function matchUrl (uri, listing) {
  var ret = false
  if (typeof uri == "string") {
    listing.forEach( m => {
      if (uri.match(new RegExp(m)) != null) ret = true
    })
  }
  return ret
}