import React, { useEffect } from "react";
import { connect } from "react-redux";
import MersenneTwister from "mersenne-twister";

const Card = ({
  songs,
  addSongs,
  player,
  previousSong,
  currentSong,
  nextSong,
}) => {
  const refs = songs.reduce((acc, value) => {
    acc[value.snippet.resourceId.videoId] = React.createRef();
    return acc;
  }, {});

  useEffect(() => {
    if (player.currentSong && refs[player.currentSong]?.current) {
      refs[player.currentSong].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [player.currentSong]);

  useEffect(() => {
    if (player.isShuffleActive === true) {
      shuffleisActive();
    }
  }, [player.isShuffleActive]);

  const shuffleisActive = () => {
    const generator = new MersenneTwister();
    let shuffleArr = [];
    shuffleArr.push(...songs);

    for (let i = shuffleArr.length - 1; i > 0; i--) {
      const j = Math.floor(generator.random() * (i + 1));
      [shuffleArr[i], shuffleArr[j]] = [shuffleArr[j], shuffleArr[i]];
    }

    addSongs(shuffleArr);

    currentSong(shuffleArr[0].snippet.resourceId.videoId);
    nextSong(shuffleArr[1].snippet.resourceId.videoId);
  };

  const handleClick = (id) => {
    const currIndex = songs.findIndex((ele) => {
      return ele.snippet?.resourceId.videoId === id;
    });
    previousSong(songs[currIndex - 1]?.snippet.resourceId.videoId);
    currentSong(songs[currIndex]?.snippet.resourceId.videoId);
    nextSong(songs[currIndex + 1]?.snippet.resourceId.videoId);
  };

  const song = songs?.map((ele) =>
    ele.snippet.title !== "Private video" &&
    ele.snippet.title !== "Deleted video" ? (
      <li
        ref={refs[ele.snippet.resourceId.videoId]}
        id={`${ele.snippet.resourceId.videoId}`}
        className={`cardContent ${
          player.currentSong === ele.snippet.resourceId.videoId ? "playing" : ""
        }`}
        onClick={() => handleClick(ele.snippet.resourceId.videoId)}
        key={ele.snippet.resourceId.videoId + ele.snippet.title}
      >
        <img
          src={ele.snippet.thumbnails.default?.url}
          alt="song image"
          height="50px"
          width="auto"
        />
        <div className="cardText">
          <label className="cardTitle">{ele.snippet.title}</label>
          <br />
          <p className="cardArtist"> {ele.snippet.videoOwnerChannelTitle}</p>
        </div>
      </li>
    ) : null
  );

  return (
    <div className="cardContainer">
      <ul className="ulListCards">{song}</ul>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    addSongs: (payload) => dispatch({ type: "songs/addSongs", payload }),
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

export default connect(mapStateToProps, mapDispatchToProps)(Card);
