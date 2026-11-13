import axios from "axios";
import { OPENAI_API_KEY } from "../config/apiConfig.js";

export const generateImageService = async (prompt) => {
  try {
    // API KEY will be inserted later
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
