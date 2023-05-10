#!/usr/bin/env node
require("dotenv").config();
// index.js

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const { TextAnalysisClient, AzureKeyCredential } = require("@azure/ai-language-text");

const OM_KEY = process.env.OM_KEY;
const OM_ENDPOINT = process.env.OM_ENDPOINT;

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv)).options({
  "auto-chat": { type: "boolean", default: false },
}).argv;

//server
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname, "./client")));
app.use(express.json())
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/html/index.html"));
});

app.get("/env", (req, res) => {
  res.json({
    TTS_KEY: process.env.TTS_KEY,
    TTS_REGION: process.env.TTS_REGION
  })
})

server.listen(3000, "0.0.0.0",() => {
  console.log("listening on *:3000");
});

//microservices
const LiveChat = require("./microservices/livechat");
const Character = require("./microservices/character");
const Logger = require("./microservices/logger");

//config
const charConfigFile = fs.readFileSync("./config/char_config.json");
const streamConfigFile = fs.readFileSync("./config/stream_config.json");
const stream_config = JSON.parse(streamConfigFile);

const logger = new Logger("kabachi.log");

const liveChat = new LiveChat(
  { liveId: stream_config.stream_id, min: stream_config.min, max: stream_config.max },);

const { parseJSONFile } = require("./utils");

const kobachi = new Character({
  charConfig: charConfigFile,
  speechConfig: {
    TTS_KEY: process.env.TTS_KEY,
    TTS_REGION: process.env.TTS_REGION,
    TTSConfigPath: "./config/tts_config.json",
  },
  openAIConfig: {
    API_KEY: process.env.OPENAI_KEY,
  },
});

fs.watchFile("./config/char_config.json", { interval: 2000 }, () => {
  console.log(chalk.bgBlueBright("CAMBIO: char_config"));
  kobachi.char = parseJSONFile("./config/char_config.json");
});

console.log(kobachi.allMessages);

liveChat.on("start", (liveId) => {
  console.log({ liveId });
});

liveChat.on("new-interval", (interval) => {
  io.emit("new-interval", interval)
})

const respondAndSpeech = async (chatItem, { resetObserver }) => {
  const message = `${chatItem.author.name}: ${chatItem.message[0].text}`;

  if (!(this.lastMessage === message && message.includes("undefined"))) {
    try {
      io.emit("selected-chat-message", { ...chatItem, selected: true });

      const res = await kobachi.respond(message);

      logger.message(`SELECTED -> ${chatItem.author.name}`, chatItem.message[0].text, "green");
      logger.message(kobachi.char.name, res, "cyan");
      logger.logJson("Mensajes", kobachi.allMessages);
      // Start the synthesizer and wait for a result.
      io.emit("speeching");
      const client = new TextAnalysisClient(OM_ENDPOINT, new AzureKeyCredential(OM_KEY));

      const results = await client.analyze("SentimentAnalysis", [{
        text: res,
        language: 'es',
        id: "0"
      }], {
        includeOpinionMining: true,
      });

      console.log(results)

      kobachi.speech(res).finally(() => {
        if (resetObserver) liveChat.resetShortenedChatObserver();
        io.emit("finished-speech", res);
      });
    } catch (e) {
      console.error(e.message);
      if (resetObserver) liveChat.resetShortenedChatObserver();
    }
    this.lastMessage = message;
  } else {
    if (resetObserver) liveChat.resetShortenedChatObserver();
  }
};

io.on("connection", (socket) => {
  if (argv.autoChat) socket.emit("auto-chat-activated");

  socket.on("live-auto", () => {
    liveChat.resetShortenedChatObserver();
  });

  socket.on("live-auto-disabled", () => {
    liveChat.stopShortenedChatObserver(
      "se presionó el botón para desactivar la lectura atumatica de comentarios"
    );
  });

  socket.on("selected-chat-message-frontend", (chatItem) =>
    respondAndSpeech(chatItem, { resetObserver: false })
  );
});

liveChat.on("chat", async (chatItem) => {
  const message = `${chatItem.author.name}: ${chatItem.message[0].text}`;

  if (!(this.lastMessage === message && message.includes("undefined"))) {
    try {
      io.emit("chat-message", chatItem);
      console.log(`MENSAJE: ${message}`);
    } catch (e) {
      console.error(e.message);
    }
    this.lastMessage = message;
  }
});

liveChat.on("shortened-chat", (chatItem) =>
  respondAndSpeech(chatItem, { resetObserver: true })
);

liveChat.start({ withObservers: argv.autoChat }).catch((e) => {
  console.log(e);
});

process.on("SIGINT", () => {
  process.exit(0);
});

logger.write();
