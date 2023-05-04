const BaseCharacter = require('./base-character')
const OpenAIService = require('./openai')
const SpeechService = require('./speech')

class Character extends BaseCharacter {


    constructor({charConfig, speechConfig, openAIConfig}) {
        super({charConfig})
        this.speechConfig = speechConfig
        this.openAIConfig = openAIConfig
        this.openAIService = new OpenAIService(openAIConfig)
        this.speechService = new SpeechService(speechConfig)
    }

      speech(texto) {
        return this.speechService.speech(texto)
      }
  
      async respond(message) {
  
        const promptResReq = await this.openAIService.promptRequest(
          message,
          this.allMessages,
          { role: "user" }
        );
        const res = promptResReq.data.choices[0].message.content;
        this.newMessageAndReply(message, res)
        return res
      }
  
  

}

module.exports = Character
