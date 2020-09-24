# cloudflare-worker-template
A simple cloudflare worker webpack template without any user config

## Usage
  1. install workers cli

      ``
      npm install -g @cloudflare/wrangler
      ``
  2. work with index.js

      you can import package with npm/yarn because of using webpack

        ``
        npm i qr-image -S
        ``

      and use in index.js

        ``
        const qr = require("qr-image")
        ``

  3. Build
    
      ``
      wrangler build
      ``
  4. deploy 
    
      copy the build js content to your worker with **Quick Edit**