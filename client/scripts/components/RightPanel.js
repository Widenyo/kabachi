import {
  html,
  render,
  useState,
  useRef,
  useEffect
} from "https://esm.sh/htm/preact/standalone";
import useMainCtx from "../hooks/useMainCtx.js";

const socket = io()

const RightPanel = () => {
  const [autoChatActivated, setAutoChatActivated] = useState(false);
  const [chatInterval, setChatInterval] = useState(0);
  const [state, dispatch] = useMainCtx()
  useEffect(() => {
    socket.on("auto-chat-activated", () => setAutoChatActivated(true));

    socket.on("new-interval", (interval) => {
      setChatInterval(interval);
    });

    const intervalReductionInterval = setInterval(() => {
      setChatInterval((prevInterval) => prevInterval - 1);
    }, 1000);

    return () => {
      clearInterval(intervalReductionInterval);
    };
  }, []);

  const leerAutomaticamente = () => {
    if (state.isAiBusy) {
      alert("OE CHIBOLO LA IA ESTÁ HABLANDO");
      return;
    }
    setAutoChatActivated(true);
    socket.emit("live-auto");
  };

  const desactivarLeerAutomaticamente = () => {
    if (state.isAiBusy) {
      alert("OE CHIBOLO LA IA ESTÁ HABLANDO");
      return;
    }
    setAutoChatActivated(false);
    socket.emit("live-auto-disabled");
  };

  return html`
    <div class="item img">
      <div class="img__img">
        <img src="/assets/pato.jpeg" />
      </div>
      <div class="buttons">
        ${autoChatActivated
          ? html` <button
              onClick=${desactivarLeerAutomaticamente}
              disabled=${state.isAiBusy}
            >
              detener lectura automatica
            </button>`
          : html` <button
              onClick=${leerAutomaticamente}
              disabled=${state.isAiBusy}
            >
              iniciar lectura automatica
            </button>`}
      </div>

      ${autoChatActivated &&
      html`<div class="item">
        <div>Intervalo: ${chatInterval > 0 ? chatInterval : ""}</div>
      </div>`}
    </div>
  `;
};

export default RightPanel;
