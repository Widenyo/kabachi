import MainTypes from "../types/MainReducer.js";

const reducer = (state, action) => {
  switch (action.type) {
    case MainTypes.TOGGLE_AI_BUSY: return {...state, isAiBusy: action.payload}
    case MainTypes.SET_SELECTED_CHAT_ITEM: return {...state, selectedChatItem: action.payload}
    case MainTypes.ADD_CHAT_ITEM: return {...state, chatItems: [...state.chatItems, action.payload]}
    case MainTypes.SET_CHAT_ITEMS: return {...state, chatItems: action.payload}

    default: throw new Error('Unexpected action');
  }
};

export default reducer