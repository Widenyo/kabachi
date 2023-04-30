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

const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
})

function ask(question) {
    rl.question(question, (answer) => {
        openAIService.promptRequest(answer", initialMessages, {role: 'user', name: "jorge2002"}).then(r => {
            rl.write(r.data.choices[0].message.content + "\n")
        }).catch(e => {
            console.log(e)
            process.exit(1)
        })
        ask(question)
    })
}

ask("Prompt: ")

function replaceCharName(str){
    return str.replaceAll("{name}", char.name)
}
