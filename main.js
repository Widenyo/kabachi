const fs = require('fs');

const API_KEY = process.env.OPENAI_KEY;

const charConfigFile = fs.readFileSync('./config/char_config.json')
let char = JSON.parse(charConfigFile)


console.log(char)