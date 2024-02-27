const express = require("express")
const httpProxy = require("http-proxy")
const app = express()
const PORT = 3000
const BASE_PATH = `https://rocketstore888.blob.core.windows.net/rocket-ride-container/__outputs`
const proxy = httpProxy.createProxy();

app.use((req, res)=>{
    const hostName = req.hostname;
    const subDomain = hostName.split('.')[0]
    console.log(subDomain)
    const resolvesTo = `${BASE_PATH}/${subDomain}/index.html`
    console.log(resolvesTo)

    proxy.web(req, res, { target : resolvesTo, changeOrigin : true})
})

app.listen(PORT, ()=> console.log(`Running Proxy Server on PORT ${PORT}`))