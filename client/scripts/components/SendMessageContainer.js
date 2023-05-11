import { html, render, useState, useRef, useContext } from 'https://esm.sh/htm/preact/standalone'
import useMainCtx from '../hooks/useMainCtx.js';
import MainContext from '../context/MainContext.js';

import SendMessageButtons from "./SendMessageButtons.js";
import MainTypes from '../types/MainReducer.js';
const socket = io()
const SendMessageContainer = ({mediaRecorder}) => {

  const [state, dispatch] = useMainCtx()
  const sendMessageTextArea = useRef(null)


  const addChatItem = (chatItem) => {
    dispatch({ type: MainTypes.ADD_CHAT_ITEM, payload: chatItem })
  }

  const sendAdminMessage = () => {

    if (state.isAiBusy) return alert("No puedes escribir un mensaje ahora, la ia está ocupada")

    const adminMessage = {
      author: {
        name: "@@ADMIN"
      },
      message: [
        {
          text: sendMessageTextArea.current.value
        }
      ]
    }
    addChatItem(adminMessage)
    socket.emit("selected-chat-message-frontend", adminMessage);

    sendMessageTextArea.current.value = ""
  }

  return html` <div class="item send-message">
    <${SendMessageButtons} />
    <div class="send-message__textfield">
      <textarea ref=${sendMessageTextArea}></textarea>
      <div class="buttons">
        <button type="submit" onClick=${sendAdminMessage}><u>S</u>end</button>
    
      </div>
    </div>
    <div class="send-message__infos">
      Ultimo Mensaje Recibido 2:00 PM on 02/16/2006.
    </div>
  </div>`;
};

export default SendMessageContainer;
