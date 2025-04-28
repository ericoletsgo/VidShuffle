import axios from "axios";

export const fetchData = async (id) => {
  let responseArr = [];
  const baseApiUrl = "http://localhost:5000/api";

  try {
    const response = await axios.get(`${baseApiUrl}/playlist`, {
      params: { playlistId: id },
    });

    const playlistDetails = response.data.playlistDetails;
    const playlistItems = response.data.playlistItems;

    // Map playlist details
    const playlistDetailsObject = {
      playlistName: playlistDetails.snippet.title,
      playlistId: playlistDetails.id,
      PlaylistImage: playlistDetails.snippet.thumbnails.medium.url,
    };

    // Map playlist items
    responseArr = playlistItems;

    const dataReturned = {
      playlistDetailsObject: playlistDetailsObject,
      responseArrToAdd: responseArr,
      currentSong: responseArr[0].snippet.resourceId.videoId,
      nextSong: responseArr[1].snippet.resourceId.videoId,
    };

    return dataReturned;
  } catch (error) {
    console.error("Error fetching data from backend:", error);
    throw error;
  }
};
