#!/usr/bin/env node

const axios = require('axios');

const getAccessToken = async () => {
  const client_id = '9507322484b543558076006713de22f2';
  const client_secret = 'a81e8129ba104ca0a3b607208a84bf77';
  const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
  const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
    },
  });
  return response.data.access_token;
};

const searchSpotify = async (query) => {
  const accessToken = await getAccessToken();
  const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=20`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
    },
  });
  const tracks = response.data.tracks.items.map(item => ({
    title: item.name,
    artists: item.artists.map(artist => artist.name).join(', '),
    thumbnail: item.album.images[0].url,
    link: item.external_urls.spotify,
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