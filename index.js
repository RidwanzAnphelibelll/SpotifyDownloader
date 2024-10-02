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

app.post('/track', async (req, res) => {
  const { url } = req.body;
  const result = await spotify(url);
  return res.json(result);
});

app.post('/search', async (req, res) => {
  const { query } = req.body;
  const results = await spotify(query);
  return res.json(results);
});

app.listen(PORT, () => {
  console.log(chalk.green(`Server running on port ${PORT}`));
});