import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

const ProgressBar = ({ player, playerRef }) => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!player.isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef?.current?.internalPlayer) {
        const p = playerRef.current.internalPlayer;
        Promise.all([p.getCurrentTime(), p.getDuration()]).then(([ct, dur]) => {
          if (dur > 0) {
            setCurrentTime(ct);
            setDuration(dur);
            setProgress((ct / dur) * 100);
          }
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player.isPlaying, player.currentSong]);

  useEffect(() => {
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [player.currentSong]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="progressContainer">
      <span className="progressTime">{formatTime(currentTime)}</span>
      <div className="progressBar">
        <div className="progressFill" style={{ width: `${progress}%` }} />
      </div>
      <span className="progressTime">{formatTime(duration)}</span>
    </div>
  );
};

const mapStateToProps = (state) => ({
  player: state.player,
});

export default connect(mapStateToProps)(ProgressBar);
