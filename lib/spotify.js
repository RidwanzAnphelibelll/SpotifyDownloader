#!/usr/bin/env node

 const got = require('got');
 const axios = require('axios');

 const searchSpotify = async (query) => {
  const response = await axios.get('https://api.agatz.xyz/api/spotify', {
    params: {
      'message': query
    }
  });

  const tracks = response.data.data.map(track => ({
    title: track.trackName,
    artist: track.artistName,
    link: track.externalUrl
  }));

  return tracks;
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
 author: '@RidwanzSaputra'
 };
 };

 const spotify = async (input) => {
 let url;
 if (/^https:\/\/open\.spotify\.com\/track\/.+$/.test(input)) {
 url = input;
 } else {
 const searchResults = await searchSpotify(input);
 if (searchResults.length === 0) {
 throw new Error('No results found for the query!');
 }
 url = searchResults[0].link;
 }
 const trackData = await spotifyDownload(url);
 return trackData;
 };

 module.exports = { spotify };