const vts = require('vtubestudio')
const fs = require('fs')
const WebSocket = require('ws')
const credpath = 'microservices/vtube-studio/auth-token.txt'


const apiClient = new vts.ApiClient({
    authTokenGetter: () => fs.readFileSync(credpath, 'utf-8'),
    authTokenSetter: (authenticationToken) => fs.writeFileSync(credpath, authenticationToken, { encoding: 'utf-8' }),
    pluginName: 'Kabachi',
    pluginDeveloper: 'g0r',
    url: 'ws://0.0.0.0:8001',
    webSocketFactory: url => new WebSocket(url),
})

apiClient.on('connect', async () => {
    const stats = await apiClient.statistics()

    console.log(`Connected to VTube Studio v${stats.vTubeStudioVersion}`)
})

module.exports = apiClient