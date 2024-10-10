#!/usr/bin/env node

const axios = require('axios');

const searchSpotify = async (query) => {
  const response = await axios.get('https://api.agatz.xyz/api/spotify', {
    params: {
      'message': query
    }
  });

  const tracks = response.data.data.slice(0, 20).map(track => ({
    title: track.trackName,
    artist: track.artistName,
    link: track.externalUrl
  }));

  return tracks;
};

const getSpotifyMetadata = async (url) => {
  const response = await axios.post('https://spotymp3.app/api/get-metadata', { url });
  return response.data.apiResponse?.data?.[0] || {};
};

const spotifyDownload = async (url) => {
  const response = await axios.post('https://spotymp3.app/api/download-track', { url });
  const audio = response.data.file_url;
  const metadata = await getSpotifyMetadata(url);
  return {
    title: metadata.name,
    artist: metadata.artist,
    releaseDate: metadata.releaseDate,
    thumbnail: metadata.cover_url,
    audio: audio,
    author: '@RidwanzSaputra'
  };
};

const spotify = async (input) => {
  let urls;
  if (/^https:\/\/open\.spotify\.com\/track\/.+$/.test(input)) {
    urls = [input];
  } else {
    const searchResults = await searchSpotify(input);
    if (searchResults.length === 0) {
      throw new Error('No results found for the query!');
    }
    urls = searchResults.map(result => result.link);
  }
  const trackData = await Promise.all(urls.map(async (url) => await spotifyDownload(url)));
  return trackData;
};

module.exports = { spotify };