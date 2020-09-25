const qr = require("qr-image")

const generate = async request => {
  const { text } = await request.json()
  const headers = { "Content-Type": "application/json" }
  const qr_png = qr.imageSync(text || "https://workers.dev")
  return new Response(JSON.stringify({ qrcode: qr_png.toString('base64') }), { headers })
}

const landing = `
<head>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
</head>
<h1>QR Generator</h1>
<p>Click the below button to generate a new QR code. This will make a request to your serverless function.</p>
<input type="text" id="text" value="https://workers.dev"></input>
<button onclick="generate()">Generate QR Code</button>
<br/>
<img src="/i/eg_tulip.jpg"  id="qrcode" />
<p>Check the "Network" tab in your browser's developer tools to see the generated QR code.</p>
<script>
  async function generate() {
    let res= await fetch(window.location.pathname, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: document.querySelector("#text").value })
    })
    let {qrcode:qrcodeSrc} =  await res.json()
    document.querySelector("#qrcode").src = "data:image/jpg;base64," + qrcodeSrc
  }
</script>
`

async function handleRequest (request) {
  let response
  if (request.method === "POST") {
    response = await generate(request)
  } else {
    response = new Response(landing, { headers: { "Content-Type": "text/html" } })
  }
  return response
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})