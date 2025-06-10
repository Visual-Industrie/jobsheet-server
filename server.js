require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Client } = require('@notionhq/client');
const app = express();
const PORT = process.env.PORT || 5000;

let notion = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });

app.get('/auth/notion', (req, res) => {
  const redirectUri = encodeURIComponent(process.env.NOTION_REDIRECT_URI);
  res.redirect(
    `https://api.notion.com/v1/oauth/authorize?client_id=${process.env.NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${redirectUri}`
  );
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  const response = await axios.post('https://api.notion.com/v1/oauth/token', {
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.NOTION_REDIRECT_URI,
  }, {
    auth: {
      username: process.env.NOTION_CLIENT_ID,
      password: process.env.NOTION_CLIENT_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { access_token } = response.data;
  notion = new Client({ auth: access_token });

  res.redirect(`http://localhost:3000/dashboard?token=${access_token}`);
});

app.get('/jobs', async (req, res) => {
  const dbId = process.env.NOTION_JOBS_DATABASE_ID;
  const result = await notion.databases.query({ database_id: dbId });
  res.json(result);
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
