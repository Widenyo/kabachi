import {
  html,
  render,
  useState,
  useRef,
  useEffect,
} from "https://esm.sh/htm/preact/standalone";
import useMainCtx from "../hooks/useMainCtx.js";
import MainTypes from "../types/MainReducer.js";

const socket = io();

const SendMessageButtons = () => {
  const [isActive, setIsActive] = useState(false);
  const [state, dispatch] = useMainCtx();
  const recognizer = useRef(null);

  const addChatItem = (chatItem) => {
    dispatch({ type: MainTypes.ADD_CHAT_ITEM, payload: chatItem });
  };

  const handleButtonClick = () => {
    if (isActive) {
      setIsActive(false);
      recognizer.current.stopContinuousRecognitionAsync();
    } else {
      setIsActive(true);
      console.log("ACTIVADO");
      recognizer.current.startContinuousRecognitionAsync();
    }
  };

  const getEnv = async () => {
    const env = await axios("/env");
    return env.data;
  };

  
  const actualizarReconocimiento = () => {
      recognizer.current.recognized = (s, e) => {
      console.log(`Texto reconocido: ${e.result.text}`);
      console.log(e);
      console.log(e.reason);

      const adminMessage = {
        author: {
          name: "@@ADMIN",
        },
        message: [
          {
            text: e.result.text,
          },
        ],
      };

      if (e.result.text !== "" && e.result.text) {
        if (!state.isAiBusy) {
          //alert(`Texto reconocido: ${e.result.text}`);
          console.log(`TEXTO TEXTO REPITO XD: ${e.result.text}`);
          addChatItem(adminMessage);
          socket.emit("selected-chat-message-frontend", adminMessage);
        } else {
          alert("LA IA ESTA OCUPADA NO ESCUCHASTE OE");
        }
      } else {
        console.log("NO DIJISTE NADA!!!");
      }
    };
  }
  
  
  const recognitionSetup = async () => {
    const { TTS_KEY, TTS_REGION } = await getEnv();
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      TTS_KEY,
      TTS_REGION
    );

    speechConfig.speechRecognitionLanguage = "es-MX";
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    recognizer.current = new SpeechSDK.SpeechRecognizer(
      speechConfig,
      audioConfig
    );
    
    actualizarReconocimiento()
  }

  useEffect(() => {
    recognitionSetup()
  }, []);

  useEffect(() => {
    if (recognizer.current === null) {
      return console.log("SERVICIO TODAVIA NO INICIADO")
    }
    actualizarReconocimiento()
  }, [state.isAiBusy]);
  return html`
    <div class="send-message__buttons">
      <button
        class="send-message__button"
        title="Escribe una sugerencia al bot"
      >
        💡
      </button>
      <button class="send-message__button" title="Send a wink">🪪</button>
      <button
        class="send-message__button"
        id="nudge-button"
        title="Send a nudge"
      >
        🥴
      </button>
      <button
        class="send-message__button"
        title="Send a voice message"
        onClick=${handleButtonClick}
        style=${{ backgroundColor: isActive ? "green" : "red" }}
      >
        📢
      </button>
      <button class="send-message__button" title="Change the font">🔤</button>
      <button class="send-message__button" title="Change text color">🎨</button>
      <button class="send-message__button" title="Send an image">🏞</button>
      <button class="send-message__button" title="Send a gift">🎁</button>
    </div>
  `;
};

export default SendMessageButtons;
