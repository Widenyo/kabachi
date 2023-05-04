const fs = require("fs")

module.exports = {
    parseJSONFile: (path) => JSON.parse(fs.readFileSync(path))
}
