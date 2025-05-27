import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import Card from "./card/Card";
import MediaButtons from "./MediaButtons/MediaButtons";
import Player from "./Player/Player";
import PlayingRightNow from "./PlayingRightNow";
import KeyboardHint from "./KeyboardHint";
import ProgressBar from "./ProgressBar";
import ShortcutsHelp from "./ShortcutsHelp";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

const Playlist = ({
  songs,
  player,
  isPlaying,
  isShuffleActive,
  previousSong,
  currentSong,
  nextSong,
  addSongs,
  isMuted,
}) => {
  const { id } = useParams();
  const [hint, setHint] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    const currIndex = songs.findIndex(
      (s) => s.snippet?.resourceId.videoId === player.currentSong
    );
    if (currIndex >= 0) {
      document.title = `(${currIndex + 1}/${songs.length}) ${songs[currIndex].snippet.title} - VidShuffle`;
    }
    return () => { document.title = "VidShuffle"; };
  }, [player.currentSong, songs]);

  const showHint = useCallback((msg) => {
    setHint(null);
    requestAnimationFrame(() => setHint(msg));
  }, []);

  const handlePrev = useCallback(() => {
    const currIndex = songs.findIndex(
      (song) => song.snippet.resourceId.videoId === player.currentSong
    );
    if (currIndex > 0) {
      previousSong(songs[currIndex - 2]?.snippet.resourceId.videoId);
      currentSong(songs[currIndex - 1]?.snippet.resourceId.videoId);
      nextSong(songs[currIndex]?.snippet.resourceId.videoId);
      showHint("Previous");
    }
  }, [songs, player.currentSong]);

  const handleNext = useCallback(() => {
    const currIndex = songs.findIndex(
      (ele) => ele.snippet?.resourceId.videoId === player.currentSong
    );
    if (currIndex < songs.length - 1) {
      previousSong(songs[currIndex]?.snippet.resourceId.videoId);
      currentSong(songs[currIndex + 1]?.snippet.resourceId.videoId);
      nextSong(songs[currIndex + 2]?.snippet.resourceId.videoId);
      showHint("Next");
    }
  }, [songs, player.currentSong]);

  const handlePlayPause = useCallback(() => {
    isPlaying(!player.isPlaying);
    showHint(player.isPlaying ? "Paused" : "Playing");
  }, [player.isPlaying]);

  const handleShuffle = useCallback(() => {
    if (!player.isShuffleActive) {
      isShuffleActive(true);
      showHint("Shuffle On");
    } else {
      isShuffleActive(false);
      let unShuffleArr = [...songs];
      unShuffleArr.sort((a, b) => a.snippet.position - b.snippet.position);
      addSongs(unShuffleArr);
      currentSong(unShuffleArr[0].snippet.resourceId.videoId);
      nextSong(unShuffleArr[1].snippet.resourceId.videoId);
      showHint("Shuffle Off");
    }
  }, [player.isShuffleActive, songs]);

  const handleMute = useCallback(() => {
    isMuted(!player.isMuted);
    showHint(player.isMuted ? "Unmuted" : "Muted");
  }, [player.isMuted]);

  const handleRepeat = useCallback(() => {
    isRepeat(!player.isRepeat);
    showHint(player.isRepeat ? "Repeat Off" : "Repeat On");
  }, [player.isRepeat]);

  const handleVolumeUp = useCallback(() => {
    if (!playerRef.current) return;
    const p = playerRef.current.internalPlayer;
    p.getVolume().then((vol) => {
      const next = Math.min(vol + 5, 100);
      p.setVolume(next);
      showHint("Volume " + next + "%");
    });
  }, []);

  const handleVolumeDown = useCallback(() => {
    if (!playerRef.current) return;
    const p = playerRef.current.internalPlayer;
    p.getVolume().then((vol) => {
      const next = Math.max(vol - 5, 0);
      p.setVolume(next);
      showHint("Volume " + next + "%");
    });
  }, []);

  const handleSeekForward = useCallback(() => {
    if (!playerRef.current) return;
    const p = playerRef.current.internalPlayer;
    p.getCurrentTime().then((t) => {
      p.seekTo(t + 5, true);
      showHint("+5s");
    });
  }, []);

  const handleSeekBack = useCallback(() => {
    if (!playerRef.current) return;
    const p = playerRef.current.internalPlayer;
    p.getCurrentTime().then((t) => {
      p.seekTo(Math.max(t - 5, 0), true);
      showHint("-5s");
    });
  }, []);

  const handleHelp = useCallback(() => {
    setShowHelp((prev) => !prev);
  }, []);

  const handleFullscreen = useCallback(() => {
    const playerEl = document.querySelector(".player");
    if (!playerEl) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      showHint("Exit Fullscreen");
    } else {
      playerEl.requestFullscreen();
      showHint("Fullscreen");
    }
  }, []);

  const keyMap = useMemo(
    () => ({
      Space: handlePlayPause,
      ArrowLeft: handlePrev,
      ArrowRight: handleNext,
      KeyS: handleShuffle,
      KeyM: handleMute,
      KeyR: handleRepeat,
      KeyF: handleFullscreen,
      ArrowUp: handleVolumeUp,
      ArrowDown: handleVolumeDown,
      "ctrl+ArrowRight": handleSeekForward,
      "ctrl+ArrowLeft": handleSeekBack,
      "?": handleHelp,
    }),
    [handlePlayPause, handlePrev, handleNext, handleShuffle, handleMute, handleRepeat, handleFullscreen, handleVolumeUp, handleVolumeDown, handleSeekForward, handleSeekBack, handleHelp]
  );

  useKeyboardShortcuts(keyMap);

  return (
    <div className="container">
      <KeyboardHint message={hint} />
      <ShortcutsHelp visible={showHelp} onClose={() => setShowHelp(false)} />
      <div className="mainContent">
        <Player playerRef={playerRef} />
        <div className="playerContainer">
          <Card />
        </div>
      </div>
      <ProgressBar playerRef={playerRef} />
      <div>
        <PlayingRightNow />
      </div>
      <div className="mediaButtonsContainer">
        <MediaButtons onFullscreen={handleFullscreen} />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  player: state.player,
  songs: state.songs,
});

const mapDispatchToProps = (dispatch) => ({
  isPlaying: (payload) => dispatch({ type: "player/isPlaying", payload }),
  isShuffleActive: (payload) =>
    dispatch({ type: "player/isShuffleActive", payload }),
  previousSong: (payload) =>
    dispatch({ type: "player/previousSong", payload }),
  currentSong: (payload) => dispatch({ type: "player/currentSong", payload }),
  nextSong: (payload) => dispatch({ type: "player/nextSong", payload }),
  addSongs: (payload) => dispatch({ type: "songs/addSongs", payload }),
  isMuted: (payload) => dispatch({ type: "player/isMuted", payload }),
  isRepeat: (payload) => dispatch({ type: "player/isRepeat", payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);
