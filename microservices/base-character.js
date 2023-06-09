class BaseCharacter {
    newChatMsg = { role: "system", content: "[Start a new chat]" };
  
    constructor({charConfig}) {
      this.char = JSON.parse(charConfig);
      this.allMessages = [...this.createInitialMesages(this.char)];
    }
  
    mainPrompt() {
      return `From now on, you are going to roleplay as ${this.char.name}`;
    }
  
    mapExampleMessages() {
      return this.char.dialogue_examples
        .map((exampleConv) => {
          const mappedConv = exampleConv.map((m) => ({
            role: m.includes("{name}") ? "assistant" : "user",
            content: m.split(": ")[1],
            //El name está comentado porque cuando incluyo los nombres de los users de ejemplo me tira error la req.
            //Creo que el campo de name es un peligro porque si alguien tiene un espacio en el nombre o un caracter especial tira bad req.
            // name: m.includes('{name}') ? 'Kabachi' : m.split(':')[0]
          }));
          const newConv = [...mappedConv, this.newChatMsg];
          return newConv;
        })
        .flat(2);
    }
  
    replaceCharName = () => this.char.description.replaceAll("{name}", this.char.name);
  
    createWholeInitialPrompt = (char) => `
      ${this.mainPrompt(char)}\n
      ${this.replaceCharName(char)}\n
      Circumstances and context of the dialogue: ${char.scenario}
    `;
  
  
    createInitialMesages = () => [
      { role: "system", content: this.createWholeInitialPrompt(this.char) },
      ...this.mapExampleMessages(this.char),
      {
        role: "system",
        content: `Remember that ${this.char.name}'s personality is: ${this.char.personality}`,
      },
      this.newChatMsg,
    ];
  
    newMessageAndReply(message, res) {
      const initialMessagesLength = this.createInitialMesages(this.char).length
      if (
        this.allMessages.length >
        initialMessagesLength + this.char.lengthLimit
      ) {
        console.log("LLEGAMOS AL LÍMITE");
        this.allMessages = this.allMessages.slice(0, initialMessagesLength).concat(this.allMessages.slice(initialMessagesLength + 2));
      }
  
      this.allMessages.push(
        ...[
          {
            role: "user",
            content: message,
          },
          {
            content: res,
            role: "assistant",
          },
        ]
      );
    }
  
  }

module.exports = BaseCharacter
