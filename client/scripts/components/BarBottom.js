import { html, render, useState, useRef, useContext } from 'https://esm.sh/htm/preact/standalone'
//import MainContext from '../context/MainContext.js';
import useMainCtx from '../hooks/useMainCtx.js';

const BarBottom = () => {
  
 const [ ,dispatch] = useMainCtx()


  return html`
    <div class="bar__bottom">
      <button class="action__button" title="Add a friend to the conversation">
        ➕
      </button>
      <button class="action__button" title="Share a file">🗂</button>
      <button class="action__button" title="Start a video call">🕹</button>
      <button class="action__button" title="Start a phone call">📞</button>
      <button
        class="action__button"
        title="Share some music"
      >
        🎵
      </button>
      <button class="action__button" title="Start a game">🎲</button>
      <button class="action__button" title="Block user">🚷</button>
    </div>
  `;
};

export default BarBottom;
