import axios from "axios";

const cache = {};

export const fetchData = async (id) => {
  const baseApiUrl = "https://vid-shuffle.vercel.app/api";
  const cacheKey = id;

  const headers = {};
  if (cache[cacheKey]?.etag) {
    headers["If-None-Match"] = cache[cacheKey].etag;
  }

  try {
    const response = await axios.get(`${baseApiUrl}/playlist`, {
      params: { playlistId: id },
      headers,
      validateStatus: (status) => status === 200 || status === 304,
    });

    if (response.status === 304 && cache[cacheKey]?.data) {
      return cache[cacheKey].data;
    }

    const playlistDetails = response.data.playlistDetails;
    const playlistItems = response.data.playlistItems;

    const playlistDetailsObject = {
      playlistName: playlistDetails.snippet.title,
      playlistId: playlistDetails.id,
      PlaylistImage: playlistDetails.snippet.thumbnails.medium.url,
    };

    const dataReturned = {
      playlistDetailsObject: playlistDetailsObject,
      responseArrToAdd: playlistItems,
      currentSong: playlistItems[0].snippet.resourceId.videoId,
      nextSong: playlistItems[1].snippet.resourceId.videoId,
    };

    cache[cacheKey] = {
      etag: response.headers?.etag || null,
      data: dataReturned,
    };

    return dataReturned;
  } catch (error) {
    if (cache[cacheKey]?.data) {
      return cache[cacheKey].data;
    }
    throw error;
  }
};
