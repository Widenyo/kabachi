require('dotenv').config()
 // index.js
const readline = require("readline")

const fs = require('fs')

const API_KEY = process.env.OPENAI_KEY;

const OpenAIService = require('./microservices/openai')

const charConfigFile = fs.readFileSync('./config/char_config.json')
let char = JSON.parse(charConfigFile)


const main_prompt = `From now on, you are going to roleplay as ${char.name}`

const newChatMsg = {role: 'system', content: "[Start a new chat]"}

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

const initialMessages = [{role: 'system', content: wholeInitialPrompt}, 
    ...mappedExampleMessages, 
    {role: 'system', content: `Remember that ${char.name}'s personality is: ${char.personality}`},
    newChatMsg]

    console.log(initialMessages)

const openAIService = new OpenAIService(API_KEY)
/*
openAIService.promptRequest("andate a cagar forra " + char.name, initialMessages, {role: 'user', name: "jorge2002"}).then(r => {
    console.log(r.data.choices[0].message.content)
}).catch(e => {
    console.log(e)
})
*/
/*
const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
})

function ask(question) {
    rl.question(question, (answer) => {
        openAIService.promptRequest(answer, initialMessages, {role: 'user', name: "jorge2002"}).then(r => {
            rl.write(r.data.choices[0].message.content + "\n")
            ask(question)
        }).catch(e => {
            console.log(e)
            process.exit(1)
        })
    })
}
*/
//ask("Prompt: ")
const { fetchChat, fetchLivePage } = require("youtube-chat/dist/requests")
const { EventEmitter } = require("events")

/**
 * YouTubeライブチャット取得イベント
 */
 class LiveChat extends EventEmitter {
  
 interval = 1000
 
  constructor(id, interval = 1000) {
    super()
    if (!id || (!("channelId" in id) && !("liveId" in id) && !("handle" in id))) {
      throw TypeError("Required channelId or liveId or handle.")
    } else if ("liveId" in id) {
      this.liveId = id.liveId
    }

    this.id = id
    this.interval = interval
  }

  async start() {
    if (this.observer) {
      return false
    }
    try {
      const options = await fetchLivePage(this.id)
      this.liveId = options.liveId
      this.options = options

      this.observer = setInterval(() => this.#execute(), this.interval)

      this.emit("start", this.liveId)
      return true
    } catch (err) {
      this.emit("error", err)
      return false
    }
  }

  stop(reason) {
    if (this.observer) {
      clearInterval(this.observer)
      this.observer = undefined
      this.emit("end", reason)
    }
  }

  async #execute() {
    if (!this.options) {
      const message = "Not found options"
      this.emit("error", new Error(message))
      this.stop(message)
      return
    }

    try {
      const [chatItems, continuation] = await fetchChat(this.options)
   
      //console.log(chatItems)
  
      //chatItems.forEach((chatItem) => this.emit("chat", chatItem))
      const lastChatItem = chatItems.at(-1)
      if (lastChatItem) this.emit("chat", lastChatItem)
      this.options.continuation = continuation
   //   console.log({continuation})
    } catch (err) {
      this.emit("error", err)
    }
  }
}

const liveChat = new LiveChat({liveId: "PONER LA ID DE UN LIVE AQUI"}, 7000)


const main = async () => {

liveChat.on("start", (liveId) => {
  console.log({liveId})
})


liveChat.on("end", (reason) => {
})


liveChat.on("chat", (chatItem) => {
    openAIService.promptRequest(chatItem.message[0].text, initialMessages, {role: 'user', name: chatItem.author.name}).then(r => {
        }).catch(e => {
            console.log(e)
            process.exit(1)
        })
    })
})

liveChat.on("error", (err) => {

  console.log(err)
})


const ok = await liveChat.start()
if (!ok) {
  console.log("Failed to start, check emitted error")
}

}

main()


function replaceCharName(str){
    return str.replaceAll("{name}", char.name)
}
