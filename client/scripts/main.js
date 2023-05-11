import {
  html,
  render,
  useState,
  useRef,
  useEffect,
  useReducer,
} from "https://esm.sh/htm/preact/standalone";

const socket = io();
const mimeType = "audio/wav";
//Components
import Conversation from "./components/Conversation.js";
import BarBottom from "./components/BarBottom.js";
import SendMessageContainer from "./components/SendMessageContainer.js";
import RightPanel from "./components/RightPanel.js";
//Context
import MainContext from "./context/MainContext.js";

//Reducers
import reducer from "./reducers/mainReducer.js";
import MainTypes from "./types/MainReducer.js";


//Initialize htm with Preact
const initialState = {
  permission: false,
  recordingStatus: "inactive",
  stream: null,
  audioChunks: [],
  audio: null,
  isIASpeeching: false,
  selectedChatItem: [],
  chatItems: []
};
//console.log(speechConfig)



const App = () => {
 
  const mediaRecorder = useRef(null);

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    socket.on("selected-chat-message", () => {
      console.log("LA IA ESTÁ OCUPADA");
      dispatch({ type: MainTypes.TOGGLE_AI_BUSY, payload: true });
    });
    socket.on("finished-speech", () => {
      dispatch({ type: MainTypes.TOGGLE_AI_BUSY, payload: false });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return html`
    <${MainContext.Provider} value=${[ state, dispatch ]}>
      <div class="window" id="window">
        <div class="bar">
          <div class="bar__top">
            <img
              class="logo"
              src="https://images.vectorhq.com/images/previews/4f8/msn-messenger-icon-psd-449180.png"
            />
            <div class="contact">
              <div class="username">KABACHI</div>
              <div class="mood">asoplata@gmail.com</div>
            </div>
          </div>
          <${BarBottom} />
        </div>
        <div class="container">
          <${Conversation} />
          <${RightPanel} />
          <${SendMessageContainer} mediaRecorder=${mediaRecorder}/>
          <div class="item img">
            <div class="img__img">
              <img
                src="https://img.discogs.com/5ngNlI-TWTyzgEwzA9hFq8i1Zsc=/fit-in/300x300/filters:strip_icc():format(jpeg):mode_rgb():quality(40)/discogs-images/R-9815155-1486810627-7022.jpeg.jpg"
              />
            </div>
          </div>
          <div class="footer">
            <a href="#">Enterate de todos los rage memes en asoplata.com</a>
          </div>
        </div>
      </div>

      <div class="nudge-text" id="nudge-text">
        <p class="nudge">You have just sent a nudge.</p>
      </div>

      <div>
    </div>
    </${MainContext.Provider}>
  `;
};

render(html`<${App} />`, document.body);
