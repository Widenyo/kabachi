

const { fetchChat, fetchLivePage } = require("youtube-chat/dist/requests")
const { EventEmitter } = require("events");

 class LiveChat extends EventEmitter {
 
  constructor(config) {
    super()
    if (!config || (!("channelId" in config) && !("liveId" in config) && !("handle" in config))) {
      throw TypeError("Required channelId or liveId or handle.")
    } else if ("liveId" in config) {
      this.liveId = config.liveId
    }

    this.config = config
    this.min = config.min
    this.max = config.max
    this.lastMessage = ""
  }

  getRandomInterval() {
    const random = Math.round(Math.random() * (this.max - this.min) + this.min) * 1000
    console.log(random)
    this.interval = random;
    this.emit("new-interval", random / 1000)
    return random
  }

  resetShortenedChatObserver() {
    console.log("alo xD")
    this.shortenedChatObserver = setTimeout(() => this.#executeShortenedChat(), this.getRandomInterval())
  }

  resetFullChatObserver(){
    this.fullChatObserver = setTimeout(() => this.#executeFullChat(), 1000)
  }

  async start({withObservers}) {
    if (this.shortenedChatObserver) {
      return false
    }
    try {
      const options = await fetchLivePage(this.config)
      this.liveId = options.liveId
      this.options = options

      const [_, continuation] = await fetchChat(this.options)
      this.options.shortenedChatContinuation = continuation
      this.options.fullChatContinuation = continuation
      if (withObservers) {
        console.log("ESTO NO PASA")
        this.shortenedChatObserver = setTimeout(() => this.#executeShortenedChat(), this.getRandomInterval())
      }
      this.fullChatObserver = setInterval(() => this.#executeFullChat(), 1000)
      this.emit("start", this.liveId)
      return true
    } catch (err) {
      this.emit("error", err)
      return false
    }
  }

  stopShortenedChatObserver(reason) {
    if (this.shortenedChatObserver) {
      console.log(reason)
      clearTimeout(this.shortenedChatObserver)
      this.shortenedChatObserver = undefined
      this.emit("end", reason)
    }
  }

  async #executeFullChat() {
    if (!this.options) {
      const message = "Not found options"
      this.emit("error", new Error(message))
      this.stop(message)
      return
    }

    try {

      const [chatItems, continuation] = await fetchChat({
        ...this.options, continuation: this.options.fullChatContinuation, 
      })
   
      //console.log(chatItems)
  
      chatItems.forEach((chatItem) => this.emit("chat", chatItem))
 
      this.options.fullChatContinuation = continuation
   //   console.log({continuation})
    } catch (err) {
      this.emit("error", err)
    }
  }

  async #executeShortenedChat() {
    if (!this.options) {
      const message = "Not found options"
      this.emit("error", new Error(message))
      this.stop(message)
      return
    }


    try {
      
      /* 
        Por alguna razón, al pasar bastante tiempo desde que el chat automatico está desactivado, 
        al volver a iniciar este vuelve [continuation] en undefined, creo yo que es porque
        la continuación que habia en this.options ya expiró al haber pasado tantos mensajes o algo así,
        el caso es que por ahoralo único que se me ocurre es volver a hacer un fetch como la
        funcion start(), aunque esto no pasará muchas veces así que no hay de que preocuparse añaññañañ
      */
      let [chatItems, continuation] = await fetchChat({
        ...this.options, continuation: this.options.shortenedChatContinuation, 
      })

      if (!continuation) {
        const options = await fetchLivePage(this.config)
        const newChatData = await fetchChat(options) 
        chatItems = newChatData[0]
        continuation = newChatData[1]
      }

      console.log("HOLA")
      //console.log(chatItems)
      const lastChatItem = chatItems.at(-1)
      if (lastChatItem) this.emit("shortened-chat", lastChatItem)
      else{
        console.log("STREAM MUERTO XD")
        this.resetShortenedChatObserver()
      }
      this.options.shortenedChatContinuation = continuation
   //   console.log({continuation})
    } catch (err) {
      this.emit("error", err)
    }
  }
}

module.exports = LiveChat
