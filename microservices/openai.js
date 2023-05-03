const { Configuration, OpenAIApi } = require('openai')

class openAIService{
    constructor({API_KEY, max_tokens}){
        this.max_tokens = max_tokens
        this.API_KEY = API_KEY
        this.config = new Configuration({
            apiKey: this.API_KEY
        }),
        this.client = new OpenAIApi(this.config);
    }

    async promptRequest(prompt, messages = [], options = {}){
        const newMessage = {
            role: options.role || 'user',
            content: prompt,
            // name: options.name || null
        }
        const allMessages = [...messages, newMessage]
        console.log(allMessages)
            const response = await this.client.createChatCompletion({
                messages: allMessages,
                temperature: options.temperature || 0.70777,
                model: "gpt-3.5-turbo",
                ...(this.max_tokens ? {max_tokens: this.max_tokens} : {})
            });
            return response
    }

}

module.exports = openAIService
