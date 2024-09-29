#!/usr/bin/env node

const cors = require('cors');
const path = require('path');
const chalk = require('chalk');
const express = require('express');
const { spotify } = require('./lib/spotify');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/download', async (req, res) => {
  const { url } = req.body;
  try {
    const result = await spotify(url);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to download the track. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(chalk.green(`Server running on port ${PORT}`));
});