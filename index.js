const qr = require('qr-image')

const generate = async request => {
  const headers = { 'Content-Type': 'image/png' }
  const qr_png = qr.imageSync('这是一段测试文本')
  return new Response(qr_png, { headers })
}

async function handleRequest(request) {
  let response = await generate(request)
  return response
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})