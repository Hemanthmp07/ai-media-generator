const axios = require("axios");

let OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
try {
  const config = require("../config/ApiConfig");
  if (config && config.OPENAI_API_KEY) {
    OPENAI_API_KEY = config.OPENAI_API_KEY;
  }
} catch (e) {
  // Ignore fallback error
}

const generateImageService = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "gpt-image-1",
        prompt,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.data[0].url; // return generated image URL
  } catch (err) {
    console.error("Image Service Error:", err.response?.data || err);
    throw new Error("Failed to generate image");
  }
};

module.exports = {
  generateImageService,
};
