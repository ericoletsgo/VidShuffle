import React, { useEffect } from "react";
import YouTube from "react-youtube";
import { connect } from "react-redux";

const Player = ({
  songs,
  player,
  isPlaying,
  previousSong,
  currentSong,
  nextSong,
  playerRef,
}) => {
  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      color: "red",
      modestbranding: 1,
    },
  };

  useEffect(() => {
    if (songs) {
      currentSong(songs[0]?.snippet.resourceId.videoId);
    }
  }, []);

  const afterSongEnds = () => {
    const currIndex = songs.findIndex((ele) => {
      return ele.snippet?.resourceId.videoId === player.currentSong;
    });
    if (currIndex < songs.length - 1) {
      previousSong(songs[currIndex]?.snippet.resourceId.videoId);
      currentSong(songs[currIndex + 1]?.snippet.resourceId.videoId);
      nextSong(songs[currIndex + 2]?.snippet.resourceId.videoId);
    } else {
      previousSong(songs[currIndex]?.snippet.resourceId.videoId);
      currentSong(songs[currIndex + 1]?.snippet.resourceId.videoId);
      nextSong("");
    }
  };

  useEffect(() => {
    player.isPlaying === true
      ? playerRef.current.internalPlayer.playVideo()
      : playerRef.current.internalPlayer.pauseVideo();
  }, [player.isPlaying]);

  useEffect(() => {
    if (player.isMuted) {
      playerRef.current.internalPlayer.mute();
    } else {
      playerRef.current.internalPlayer.unMute();
    }
  }, [player.isMuted]);

  const onReady = (e) => {
    e.target.playVideo();
  };

  const onStateChange = (e) => {
    if (e.data === 0) {
      if (
        songs.findIndex(
          (ele) => ele.snippet.resourceId.videoId === player.currentSong
        ) ===
        songs.length - 1
      ) {
        isPlaying(false);
      } else afterSongEnds();
    } else if (e.data === 2) {
      isPlaying(false);
    } else if (e.data === 1) {
      isPlaying(true);
    }
  };
  return (
    <div className="player">
      <YouTube
        className="youtubePlayer"
        videoId={player.currentSong}
        opts={opts}
        ref={playerRef}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    isPlaying: (payload) => dispatch({ type: "player/isPlaying", payload }),
    previousSong: (payload) =>
      dispatch({ type: "player/previousSong", payload }),
    currentSong: (payload) => dispatch({ type: "player/currentSong", payload }),
    nextSong: (payload) => dispatch({ type: "player/nextSong", payload }),
  };
};

const mapStateToProps = (state) => {
  return {
    songs: state.songs,
    player: state.player,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Player);
