require("dotenv").config();
// index.js

const fs = require("fs");
const chalk = require("chalk")
//microservices

const LiveChat = require("./microservices/livechat");
const Character = require("./microservices/character");

//config
const charConfigFile = fs.readFileSync("./config/char_config.json");
const streamConfigFile = fs.readFileSync("./config/stream_config.json");
const stream_config = JSON.parse(streamConfigFile);

const liveChat = new LiveChat(
  { liveId: stream_config.stream_id }
);

const { parseJSONFile } = require("./utils");

const kobachi = new Character({
  charConfig: charConfigFile, 
  speechConfig: {
    TTS_KEY: process.env.TTS_KEY,
    TTS_REGION: process.env.TTS_REGION,
    TTSConfigPath: "./config/tts_config.json"
  },
  openAIConfig: {
    API_KEY: process.env.OPENAI_KEY
  }
});

fs.watchFile('./config/char_config.json', {interval: 2000}, () => {
  console.log(chalk.bgBlueBright("CAMBIO: char_config"))
  kobachi.char = parseJSONFile("./config/char_config.json")
})

console.log(kobachi.allMessages);

liveChat.on("start", (liveId) => {
  console.log({ liveId });
});

liveChat.on("end", (reason) => {
  console.log(reason);
  fs.writeFile("log.json", JSON.stringify(kobachi.allMessages));
});

liveChat.on("chat", async (chatItem) => {
  const message = `${chatItem.author.name}: ${chatItem.message[0].text}`;

  if (!(this.lastMessage === message && message.includes("undefined"))) {
    try {
   
      const res = await kobachi.respond(message)

      const [messageAuthor, messageContent] = message.split(': ')
      
      console.log("\n")
      console.log(chalk.black.bgGreenBright(messageAuthor) + chalk.green(` ${messageContent}`))
      console.log(chalk.black.bgCyanBright(`${kobachi.char.name}:`) + chalk.cyan(` ${res}`))
      console.log("\n")

      // Start the synthesizer and wait for a result.
      kobachi.speech(res).finally(() => liveChat.resetObserver())
    } catch (e) {
      console.error(e.message);
      liveChat.resetObserver();
    }
    this.lastMessage = message;
  }
});

liveChat.on("error", (err) => {
  console.log(err);
  fs.writeFile("log.json", JSON.stringify(kobachi.allMessages));
});

liveChat.start().catch((e) => {
  console.log(e);
});


process.on("SIGINT", () => {
  fs.writeFileSync("log.json", JSON.stringify(kobachi.allMessages))
  process.exit(0)
})
