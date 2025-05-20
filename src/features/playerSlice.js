const initialState = {
  isPlaying: true,
  previousSong: "",
  currentSong: "",
  nextSong: "",
  isShuffleActive: false,
  isMuted: false,
  isRepeat: false,
};

export default function playerRedicer(state = initialState, action) {
  switch (action.type) {
    case "player/isPlaying": {
      return { ...state, isPlaying: action.payload };
    }
    case "player/isShuffleActive": {
      return { ...state, isShuffleActive: action.payload };
    }
    case "player/previousSong": {
      return { ...state, previousSong: action.payload };
    }
    case "player/currentSong": {
      return { ...state, currentSong: action.payload };
    }
    case "player/nextSong": {
      return { ...state, nextSong: action.payload };
    }
    case "player/isMuted": {
      return { ...state, isMuted: action.payload };
    }
    case "player/isRepeat": {
      return { ...state, isRepeat: action.payload };
    }
    default:
      return state;
  }
}
