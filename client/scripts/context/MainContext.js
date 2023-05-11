import { createContext } from "https://esm.sh/htm/preact/standalone";

const MainContext = createContext([
  {
    permission: false,
    recordingStatus: "inactive",
    stream: null,
    audioChunks: [],
    audio: null,
    dispatch: "",
    chatItems: [],
    selectedChatItem: [],
  },
  () => {},
]);

export default MainContext;
