import { html, render, useState, useRef, useEffect } from 'https://esm.sh/htm/preact/standalone'
import useMainCtx from '../hooks/useMainCtx.js';
import MainTypes from '../types/MainReducer.js';
const socket = io();

const Chat = () => {

  const [state, dispatch] = useMainCtx()


  const addChatItem = (chatItem) => {
    dispatch({ type: MainTypes.ADD_CHAT_ITEM, payload: chatItem })
  }

  const setChatItems = (chatItems) => {
    dispatch({ type: MainTypes.SET_CHAT_ITEMS, payload: chatItems })
  }

  const setSelectedChatItem = (selectedChatItem) => {
    dispatch({ type: MainTypes.SET_SELECTED_CHAT_ITEM, payload: selectedChatItem })
  }

  const chatBoxRef = useRef(null);
  useEffect(() => {
    socket.on("chat-message", (chatItem) => {
      console.log("PRUEBA_CHAT_MESSAGE");
      addChatItem(chatItem)
    });
    socket.on("selected-chat-message", (chatItem) => {
      setSelectedChatItem(chatItem);
    });
    socket.on("finished-speech", (res) => {
      console.log(res)
      addChatItem({
        author: {name: "Kabachi"}, message: [{text: res}]
      })
    });

  }, []);

  useEffect(() => {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [state.chatItems]);

  useEffect(() => {
    if (state.chatItems.length === 0) return;

    const lastChatItemText =  state.chatItems.at(-1).message[0].text
    const selectedChatItemText =  state.selectedChatItem.message[0].text

    const ultimoMensajeEsIgualQueMensajeSeleccionado =
      lastChatItemText === selectedChatItemText &&
      state.selectedChatItem.author.name === state.chatItems.at(-1).author.name;
    //EN TEORÍA esto siempre debería dar true pero no estoy completamente seguro así que
    if (ultimoMensajeEsIgualQueMensajeSeleccionado) {
      setChatItems([...state.chatItems.slice(0, -1), state.selectedChatItem]);
    } else {
      const selectedChatItemIndex = state.chatItems.findLastIndex(
        (chatItem) =>
          state.selectedChatItem.message[0].text === chatItem.message[0].text &&
          state.selectedChatItem.author.name === chatItem.author.name
      );
      const copyOfChatItems = [...state.chatItems];
      copyOfChatItems[selectedChatItemIndex] = state.selectedChatItem;
      setChatItems(copyOfChatItems);
    }
  }, [state.selectedChatItem]);

  const selectChatItem = (chatItem) => {
    if (state.isAiBusy) {
      alert("OE CHIBOLO ESTÁ HABLANDO LA IA");
    } else {
      socket.emit("selected-chat-message-frontend", chatItem);
    }
  };

  return html`
    <div class="item conversation" id="conversation" ref=${chatBoxRef}>
      ${state.chatItems.map((message) => {
        return html`
          <div
            onClick=${() => selectChatItem(message)}
            class="chat-item ${message.selected ? "selected-message" : ""}"
          >
            <p>${message.author?.name} dice:</p>
            <p class="message">${message.message[0].text}</p>
          </div>
        `;
      })}
    </div>
  `;
};
export default Chat;
