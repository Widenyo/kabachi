require('dotenv').config()
 // index.js

const fs = require('fs')

const API_KEY = process.env.OPENAI_KEY;

const OpenAIService = require('./microservices/openai')

const charConfigFile = fs.readFileSync('./config/char_config.json')
const streamConfigFile = fs.readFileSync('./config/stream_config.json')
const stream_config = JSON.parse(streamConfigFile)
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

const allMessages = [...initialMessages]

const openAIService = new OpenAIService(API_KEY)

const { fetchChat, fetchLivePage } = require("youtube-chat/dist/requests")
const { EventEmitter } = require("events")

 class LiveChat extends EventEmitter {
 
  constructor(id, interval) {
    super()
    if (!id || (!("channelId" in id) && !("liveId" in id) && !("handle" in id))) {
      throw TypeError("Required channelId or liveId or handle.")
    } else if ("liveId" in id) {
      this.liveId = id.liveId
    }

    this.id = id
    this.interval = interval
    this.lastMessage = ""
  }

  resetObserver(){
    this.observer = setTimeout(() => this.#execute(), this.interval)
  }

  async start() {
    if (this.observer) {
      return false
    }
    try {
      const options = await fetchLivePage(this.id)
      this.liveId = options.liveId
      this.options = options

      this.observer = setTimeout(() => this.#execute(), this.interval)

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
      else{
        console.log("STREAM MUERTO XD")
        this.resetObserver()
      }
      this.options.continuation = continuation
   //   console.log({continuation})
    } catch (err) {
      this.emit("error", err)
    }
  }
}



const liveChat = new LiveChat({liveId: stream_config.stream_id}, stream_config.time)

const main = async () => {

liveChat.on("start", (liveId) => {
  console.log({liveId})
})


liveChat.on("end", (reason) => {
    console.log(reason)
})


liveChat.on("chat", async (chatItem) => {
    const message = `${chatItem.author.name}: ` + chatItem.message[0].text
    if(!(this.lastMessage === message && message.includes("undefined"))){
        try{
            const promptResReq = await openAIService.promptRequest(message, allMessages, {role: "user"})
            const res = promptResReq.data.choices[0].message.content
            newMessageAndReply(message, res)
            console.log(message + '\n', `${char.name}: ${res}`)
        }catch(e){
            console.error(e.message)
        }
        this.lastMessage = message
    }
    liveChat.resetObserver()
    })
}

liveChat.on("error", (err) => {

  console.log(err)
})


liveChat.start().catch(e => {
    console.log(e)
})

main()


function replaceCharName(str){
    return str.replaceAll("{name}", char.name)
}

function newMessageAndReply(message, res){
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