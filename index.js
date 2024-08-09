const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Instagram API credentials
const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = process.env.IG_USER_ID;

// OpenAI API credentials
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Generate caption using OpenAI's GPT-3.5
async function generateCaption() {
  const response = await axios.post(
    'https://api.openai.com/v1/completions',
    {
      model: 'text-davinci-003',
      prompt: 'Generate a caption for a beautiful pink and glittery nail art.',
      max_tokens: 50,
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].text.trim();
}

// Upload photo to Instagram
async function uploadPhoto(photoPath, caption) {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(photoPath));
  formData.append('caption', caption);

  const response = await axios.post(
    `https://graph.facebook.com/v12.0/${INSTAGRAM_USER_ID}/media`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        ...formData.getHeaders(),
      },
    }
  );

  return response.data;
}

// Publish photo on Instagram
async function publishPhoto(mediaId) {
  const response = await axios.post(
    `https://graph.facebook.com/v12.0/${INSTAGRAM_USER_ID}/media_publish`,
    {
      creation_id: mediaId,
    },
    {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

// Main function
(async () => {
  try {
    const photoPath = path.join(__dirname, 'photo.jpg');
    const caption = await generateCaption();
    console.log('Generated Caption:', caption);

    const uploadResponse = await uploadPhoto(photoPath, caption);
    console.log('Upload Response:', uploadResponse);

    const publishResponse = await publishPhoto(uploadResponse.id);
    console.log('Publish Response:', publishResponse);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})();
