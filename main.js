require('dotenv').config()
// index.js

const fs = require('fs')

//config
const charConfigFile = fs.readFileSync('./config/char_config.json')
const streamConfigFile = fs.readFileSync('./config/stream_config.json')
const ttsConfigFile = fs.readFileSync('./config/tts_config.json')
const stream_config = JSON.parse(streamConfigFile)
const tts_config = JSON.parse(ttsConfigFile)

const API_KEY = process.env.OPENAI_KEY;


//microservices
const OpenAIService = require('./microservices/openai');
const LiveChat = require("./microservices/livechat")

const openAIService = new OpenAIService(API_KEY)

const liveChat = new LiveChat({ liveId: stream_config.stream_id }, stream_config.time)

//tts
const player = require('node-wav-player');
const ttsSdk = require('microsoft-cognitiveservices-speech-sdk');


const char = JSON.parse(charConfigFile)


const main_prompt = `From now on, you are going to roleplay as ${char.name}.`

const newChatMsg = { role: 'system', content: "[Start a new chat]" }

const mappedExampleMessages = char.dialogue_examples.map(exampleConv => {
  const mappedConv = exampleConv.map((m) => {
    return {
      role: m.includes('{name}') ? 'assistant' : 'user',
      content: m.split(': ')[1],
      //El name está comentado porque cuando incluyo los nombres de los users de ejemplo me tira error la req.
      //Creo que el campo de name es un peligro porque si alguien tiene un espacio en el nombre o un caracter especial tira bad req.
      // name: m.includes('{name}') ? 'Kabachi' : m.split(':')[0]
    }
  })

  console.log(mappedConv)

  const newConv = [...mappedConv, newChatMsg]
  return newConv
}).flat(2)


const wholeInitialPrompt = `
    ${main_prompt}\n
    ${replaceCharName(char.description)}\n
    Circumstances and context of the dialogue: ${char.scenario}
`

const initialMessages = [{ role: 'system', content: wholeInitialPrompt },
...mappedExampleMessages,
{ role: 'system', content: `Remember that ${char.name}'s personality is: ${char.personality}` },
  newChatMsg]

const allMessages = [...initialMessages]



liveChat.on("start", (liveId) => {
  console.log({ liveId })
})


liveChat.on("end", (reason) => {
  console.log(reason)
})

liveChat.on("chat", async (chatItem) => {
  const message = `${chatItem.author.name}: ${chatItem.message[0].text}`

  if (!(this.lastMessage === message && message.includes("undefined"))) {
    try {
      const promptResReq = await openAIService.promptRequest(message, allMessages, { role: "user" })
      const res = promptResReq.data.choices[0].message.content
      newMessageAndReply(message, res)
      console.log(message + '\n', `${char.name}: ${res}`)
      // Start the synthesizer and wait for a result.
      const speechConfig = ttsSdk.SpeechConfig.fromSubscription(process.env.TTS_KEY, process.env.TTS_REGION);
      const audiocfg = ttsSdk.AudioConfig.fromAudioFileOutput(tts_config.outputName);
      const synthesizer = new ttsSdk.SpeechSynthesizer(speechConfig, audiocfg);
      console.log(ssml(res))
      synthesizer.speakSsmlAsync(ssml(res),
        async (result) => {
          if (result.reason === ttsSdk.ResultReason.SynthesizingAudioCompleted) {
            console.log('Sintetizado')
            synthesizer.close();
            await player.play({ path: tts_config.outputName, sync: true })
            console.log('Finished playing audio.')
          } else {
            console.error("Speech synthesis canceled, " + result.errorDetails +
              "\nDid you set the speech resource key and region values?");
            synthesizer.close();
          }
          liveChat.resetObserver()
        },
        (err) => {
          console.trace("err - " + err);
          liveChat.resetObserver()
          synthesizer.close();
        });
      console.log("Now synthesizing");
    } catch (e) {
      console.error(e.message)
      liveChat.resetObserver();
    }
    this.lastMessage = message
  }
})


liveChat.on("error", (err) => {

  console.log(err)
})


liveChat.start().catch(e => {
  console.log(e)
})


function replaceCharName(str){
  return str.replaceAll("{name}", char.name)
}

function ssml(texto) {
  const {voiceName, rate, contour, pitch, volume} = tts_config
  return `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="es-ES">
  <voice name="${voiceName || "es-ES-IreneNeural"}">
    <prosody volume="${volume || "default"}" rate="${rate || "default"}" contour="${contour || ""}" pitch="${pitch || "default"}">
      ${texto}
    </prosody>
  </voice>
</speak>
`
}

const newMessageAndReply = (message, res) => {
  allMessages.push(...[{
    role: 'user',
    content: message
  },
  {
    content: res,
    role: 'assistant',
  }]
  )
}
