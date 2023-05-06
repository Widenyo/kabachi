
const { fetchChat, fetchLivePage } = require("youtube-chat/dist/requests")
const { EventEmitter } = require("events");

const fs = require('fs')

let config = JSON.parse(fs.readFileSync('config/stream_config.json'));

 class LiveChat extends EventEmitter {
 
  constructor(id) {
    super()
    if (!id || (!("channelId" in id) && !("liveId" in id) && !("handle" in id))) {
      throw TypeError("Required channelId or liveId or handle.")
    } else if ("liveId" in id) {
      this.liveId = id.liveId
    }

    this.id = id
    this.lastMessage = ""
  }

  getRandomInterval(){
    const random = (Math.random() * (config.max - config.min) + config.min) * 1000
    console.log(random)
    return random
  }

  resetObserver(){
    config = JSON.parse(fs.readFileSync('config/stream_config.json'));
    this.observer = setTimeout(() => this.#execute(), this.getRandomInterval())
  }

  async start() {
    if (this.observer) {
      return false
    }
    try {
      const options = await fetchLivePage(this.id)
      this.liveId = options.liveId
      this.options = options

      this.observer = setTimeout(() => this.#execute(), this.getRandomInterval())

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

module.exports = LiveChat
