import { useContext, createContext } from "https://esm.sh/htm/preact/standalone";
import MainContext from "../context/MainContext.js";

const useMainCtx = () => useContext(MainContext)

export default useMainCtx