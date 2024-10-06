#!/usr/bin/env node

const got = require('got');
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
  const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
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
  return await Promise.all(tracks.map(track => spotifyDownload(track.link)));
};

const getSpotifyMetadata = async (url) => {
  const response = await got.post('https://spotymp3.app/api/get-metadata', {
    json: { url: url },
    responseType: 'json',
  });
  return response.body.apiResponse?.data?.[0] || {};
};

const spotifyDownload = async (url) => {
  const response = await got.post('https://spotymp3.app/api/download-track', {
    json: { url: url },
    responseType: 'json',
  });
  const audio = response.body.file_url;
  const metadata = await getSpotifyMetadata(url);
  return {
    title: metadata.name,
    artist: metadata.artist,
    releaseDate: metadata.releaseDate,
    thumbnail: metadata.cover_url,
    audio: audio,
    author: '@RidwanzSaputra',
  };
};

const spotify = async (input) => {
  if (/^https:\/\/open\.spotify\.com\/track\/.+$/.test(input)) {
    const trackData = await spotifyDownload(input);
    return [trackData];
  } else {
    const trackDownloads = await searchSpotify(input);
    if (trackDownloads.length === 0) {
      throw new Error('No results found for the query!');
    }
    
    return trackDownloads.map((track, index) => ({
      number: index + 1,
      title: track.title,
      artist: track.artist,
      releaseDate: track.releaseDate,
      thumbnail: track.thumbnail,
      audio: track.audio,
      author: track.author,
    }));
  }
};

module.exports = { spotify };