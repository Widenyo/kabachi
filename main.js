require("dotenv").config();
// index.js

const fs = require("fs");

//microservices
const OpenAIService = require("./microservices/openai");
const LiveChat = require("./microservices/livechat");
const Character = require("./microservices/character");

//config
const charConfigFile = fs.readFileSync("./config/char_config.json");
const streamConfigFile = fs.readFileSync("./config/stream_config.json");
const ttsConfigFile = fs.readFileSync("./config/tts_config.json");
const stream_config = JSON.parse(streamConfigFile);
const tts_config = JSON.parse(ttsConfigFile);

const API_KEY = process.env.OPENAI_KEY;
const openAIService = new OpenAIService({API_KEY});

const liveChat = new LiveChat(
  { liveId: stream_config.stream_id },
  stream_config.time
);

//tts
const player = require("node-wav-player");
const ttsSdk = require("microsoft-cognitiveservices-speech-sdk");
const { getCharConfig, getTTSConfig } = require("./utils");

const audiocfg = ttsSdk.AudioConfig.fromAudioFileOutput(
  getTTSConfig().outputName
);

const kobachi = new Character({charConfig: charConfigFile, audiocfg,tts_config});

fs.watchFile('./config/char_config.json', {interval: 2000}, () => {
  console.log("CAMBIO: char_config")
  kobachi.char = JSON.parse(getCharConfig())
})

fs.watchFile('./config/tts_config.json', {interval: 2000}, () => {
  console.log("CAMBIO: tts_config")
  kobachi.tts_config = getTTSConfig()
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
      const promptResReq = await openAIService.promptRequest(
        message,
        kobachi.allMessages,
        { role: "user" }
      );
      const res = promptResReq.data.choices[0].message.content;
      kobachi.newMessageAndReply(message, res);
      console.log(message + "\n", `${kobachi.char.name}: ${res}`);
      // Start the synthesizer and wait for a result.
      const speechConfig = ttsSdk.SpeechConfig.fromSubscription(
        
        process.env.TTS_KEY,
        process.env.TTS_REGION
      );
      const audiocfg = ttsSdk.AudioConfig.fromAudioFileOutput(
        getTTSConfig().outputName
      );
      const synthesizer = new ttsSdk.SpeechSynthesizer(speechConfig, audiocfg);
      console.log(kobachi.ssml(res));
      synthesizer.speakSsmlAsync(
        kobachi.ssml(res),
        async (result) => {
          if (
            result.reason === ttsSdk.ResultReason.SynthesizingAudioCompleted
          ) {
            console.log("Sintetizado");
            synthesizer.close();
            await player.play({ path: getTTSConfig().outputName, sync: true });
            console.log("Finished playing audio.");
          } else {
            console.error(
              "Speech synthesis canceled, " +
                result.errorDetails +
                "\nDid you set the speech resource key and region values?"
            );
            synthesizer.close();
          }
          liveChat.resetObserver();
        },
        (err) => {
          console.trace("err - " + err);
          liveChat.resetObserver();
          synthesizer.close();
        }
      );
      console.log("Now synthesizing");
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

