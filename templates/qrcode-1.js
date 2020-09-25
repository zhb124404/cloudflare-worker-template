/**
 * @description 二维码生成工具
 * @method POST
 * @params {text:"编码内容"}
 */

const qr = require('qr-image')

const generate = async request => {
  try {
    const { text } = await request.json()
  } catch (error) {
    return new Response(
      "参数错误\n",
      {
        status: 403,
        statusText: 'Forbidden',
        headers: {
          "Content-Type": "text/html;charset=utf-8"
        }
      })
  }
  const headers = { 'Content-Type': 'image/png' }
  const qr_png = qr.imageSync(text)
  return new Response(qr_png, { headers })
}

async function handleRequest (request) {
  let response = await generate(request)
  return response
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})