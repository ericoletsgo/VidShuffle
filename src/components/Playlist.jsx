import React, { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import Card from "./card/Card";
import MediaButtons from "./MediaButtons/MediaButtons";
import Player from "./Player/Player";
import PlayingRightNow from "./PlayingRightNow";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

const Playlist = ({
  songs,
  player,
  isPlaying,
  previousSong,
  currentSong,
  nextSong,
}) => {
  const { id } = useParams();

  const handlePrev = useCallback(() => {
    const currIndex = songs.findIndex(
      (song) => song.snippet.resourceId.videoId === player.currentSong
    );
    if (currIndex > 0) {
      previousSong(songs[currIndex - 2]?.snippet.resourceId.videoId);
      currentSong(songs[currIndex - 1]?.snippet.resourceId.videoId);
      nextSong(songs[currIndex]?.snippet.resourceId.videoId);
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
    }
  }, [songs, player.currentSong]);

  const handlePlayPause = useCallback(() => {
    isPlaying(!player.isPlaying);
  }, [player.isPlaying]);

  const keyMap = useMemo(
    () => ({
      Space: handlePlayPause,
      ArrowLeft: handlePrev,
      ArrowRight: handleNext,
    }),
    [handlePlayPause, handlePrev, handleNext]
  );

  useKeyboardShortcuts(keyMap);

  return (
    <div className="container">
      <div className="mainContent">
        <Player />
        <div className="playerContainer">
          <Card />
        </div>
      </div>
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
  previousSong: (payload) =>
    dispatch({ type: "player/previousSong", payload }),
  currentSong: (payload) => dispatch({ type: "player/currentSong", payload }),
  nextSong: (payload) => dispatch({ type: "player/nextSong", payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);
