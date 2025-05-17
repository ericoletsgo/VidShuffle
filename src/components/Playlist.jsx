import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import Card from "./card/Card";
import MediaButtons from "./MediaButtons/MediaButtons";
import Player from "./Player/Player";
import PlayingRightNow from "./PlayingRightNow";
import KeyboardHint from "./KeyboardHint";
import ProgressBar from "./ProgressBar";
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
  const playerRef = useRef(null);

  useEffect(() => {
    const currIndex = songs.findIndex(
      (s) => s.snippet?.resourceId.videoId === player.currentSong
    );
    if (currIndex >= 0) {
      document.title = songs[currIndex].snippet.title + " - VidShuffle";
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

  const keyMap = useMemo(
    () => ({
      Space: handlePlayPause,
      ArrowLeft: handlePrev,
      ArrowRight: handleNext,
      KeyS: handleShuffle,
      KeyM: handleMute,
    }),
    [handlePlayPause, handlePrev, handleNext, handleShuffle, handleMute]
  );

  useKeyboardShortcuts(keyMap);

  return (
    <div className="container">
      <KeyboardHint message={hint} />
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
        <MediaButtons />
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);
