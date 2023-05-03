const fs = require("fs")

module.exports = {
    getTTSConfig: () => JSON.parse(fs.readFileSync("./config/tts_config.json")),
    getStreamConfig: () => JSON.parse(fs.readFileSync("./config/stream_config.json")),
    getCharConfig: () => fs.readFileSync("./config/char_config.json")
}
