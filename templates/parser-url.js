const qs = require('query-string')
const generate = async request => {
  let query = qs.parse((new URL(request.url)).search)
  const headers = { "Content-Type": "application/json" }
  return new Response(JSON.stringify(query), { headers })
}

async function handleRequest (request) {
  let response
  if (request.method === "GET") {
    response = await generate(request)
  } else {
    response = new Response("只支持GET请求", { headers: { "Content-Type": "text/html" } })
  }
  return response
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})