const OpenAI = require("openai");
const { ApiError } = require("../middleware/errorHandler");
const { findRealPhotos } = require("../services/photoService");

let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (err) {
    console.warn("[Image] OpenAI client init warning:", err.message);
  }
}

// Clean entity text by stripping "real photo of", "photo of", etc.
function cleanSearchQuery(raw) {
  return raw
    .replace(/\b(real photo of|real photograph of|actual photo of|real photos?|authentic photo of|picture of|photo of|image of|hd photo of)\b/gi, "")
    .trim();
}

// Intelligent prompt expansion for true photographic camera quality (no cartoon/CGI look)
function enrichPrompt(rawPrompt, style = "natural", quality = "standard") {
  let p = rawPrompt.trim();

  // Known entity & personality photographic descriptions
  const personalityMap = [
    {
      regex: /\b(pm\s+modi|narendra\s+modi|modiji?)\b/i,
      replacement: "authentic documentary photograph of Prime Minister Narendra Modi, candid press photo, Canon EOS R5, natural skin textures, real beard and spectacles, professional photojournalism, no 3D render, no CGI",
    },
    {
      regex: /\b(srk|shah\s*rukh\s*khan)\b/i,
      replacement: "candid realistic photograph of Shah Rukh Khan, red carpet press photograph, real skin texture, authentic lighting, 85mm portrait lens, no CGI, no cartoon",
    },
    {
      regex: /\b(virat\s+kohli|kohli)\b/i,
      replacement: "authentic real-life photograph of Virat Kohli on cricket field, candid sports photojournalism, Canon EOS 1D X Mark III, natural skin pores, realistic sweat and turf, sharp focus, no 3D render, no CGI, no smooth cartoon skin",
    },
    {
      regex: /\b(dhoni|ms\s+dhoni)\b/i,
      replacement: "authentic press photograph of MS Dhoni, candid portrait, real sports photography, natural lighting, high resolution, no CGI",
    },
    {
      regex: /\b(elon\s+musk|elon)\b/i,
      replacement: "candid press photo of Elon Musk, authentic documentary photography, natural ambient lighting, 35mm DSLR, realistic skin texture, no 3d render",
    },
    {
      regex: /\b(donald\s+trump|trump)\b/i,
      replacement: "press photography of Donald Trump, candid photojournalism, realistic lighting, formal suit, no digital illustration",
    },
    {
      regex: /\b(mahatma\s+gandhi|gandhiji?)\b/i,
      replacement: "historical authentic archive photograph of Mahatma Gandhi, real documentary photography, natural depth, sepia documentary archive",
    },
    {
      regex: /\b(apj\s+abdul\s+kalam|abdul\s+kalam)\b/i,
      replacement: "authentic portrait photograph of Dr. A.P.J. Abdul Kalam, warm natural smile, real camera shot, dignified documentary portrait",
    },
  ];

  for (const item of personalityMap) {
    if (item.regex.test(p)) {
      p = p.replace(item.regex, item.replacement);
      break;
    }
  }

  // Enforce authentic camera photography keywords, ban digital art / CGI keywords
  if (style === "natural") {
    p += ", raw photo, candid 35mm DSLR photography, natural daylight, authentic skin pores and texture, photojournalism, sharp focus, highly detailed, no 3D render, no CGI, no cartoon, no airbrushing";
  } else if (style === "vivid") {
    p += ", professional commercial photography, Hasselblad H6D-100c, rich natural contrast, 8k photograph, sharp optical focus, genuine photograph";
  }

  if (quality === "hd") {
    p += ", ultra-high resolution photography, crisp lens optics, National Geographic quality";
  }

  return p;
}

// Generate image via Pollinations AI (FLUX / SD with photoreal camera parameters)
function generatePollinationsUrl(prompt, size = "1024x1024", quality = "standard", style = "natural") {
  let [width, height] = (size || "1024x1024").split("x").map(Number);
  width = width || 1024;
  height = height || 1024;

  const styledPrompt = enrichPrompt(prompt, style, quality);
  const seed = Math.floor(Math.random() * 90000000) + 10000000;
  const encoded = encodeURIComponent(styledPrompt);
  // Add model=flux for best realistic rendering
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

  return { imageUrl, styledPrompt };
}

exports.generateImage = async (req, res, next) => {
  try {
    const {
      prompt,
      size = "1024x1024",
      quality = "standard",
      style = "natural",
      mode = "real", // Default to "real" or "ai" based on client
    } = req.validated || req.body;

    if (!prompt || !prompt.trim()) {
      throw new ApiError(400, "Prompt is required");
    }

    const cleanQuery = cleanSearchQuery(prompt);
    console.log(`[Image] Request for prompt: "${prompt.slice(0, 60)}..." (mode: ${mode}, size: ${size})`);

    // ──────────────────────────────────────────────────────────────────────────
    // 1. REAL PHOTO MODE (Authentic camera photos from Wikipedia/Wikimedia Commons)
    // ──────────────────────────────────────────────────────────────────────────
    if (mode === "real" || /\b(real photo|authentic photo|actual photo)\b/i.test(prompt)) {
      console.log(`[Image] Searching authentic real photos for: "${cleanQuery}"`);
      const realPhotos = await findRealPhotos(cleanQuery || prompt);

      if (realPhotos && realPhotos.length > 0) {
        const primary = realPhotos[0];
        console.log(`[Image] Found ${realPhotos.length} real photos. Primary: ${primary.title}`);

        return res.json({
          success: true,
          data: {
            isRealPhoto: true,
            mode: "real",
            image: primary.url,
            imageUrl: primary.url,
            title: primary.title,
            description: primary.description,
            author: primary.author,
            source: primary.source,
            sourceUrl: primary.sourceUrl,
            photos: realPhotos, // provide all candidates for gallery selection
            prompt: prompt.trim(),
            revisedPrompt: `Authentic photograph: ${primary.title}`,
            size,
            quality,
            style,
            provider: primary.source,
            generated: new Date().toISOString(),
          },
        });
      }

      if (mode === "real") {
        throw new ApiError(
          404,
          `No authentic archive photos found for "${cleanQuery}". Please check the spelling, try a specific public figure, athlete, or landmark (e.g. "Virat Kohli", "Taj Mahal"), or switch to AI Photorealism mode.`
        );
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. AI GENERATION MODE (Photorealistic DSLR camera AI, eliminating cartoon look)
    // ──────────────────────────────────────────────────────────────────────────
    let finalImageUrl = null;
    let revisedPrompt = prompt.trim();
    let provider = "FLUX Photorealistic Camera Engine";

    // 1. Try OpenAI if API key is provided
    if (openai && process.env.OPENAI_API_KEY) {
      const modelsToTry = ["gpt-image-1", "dall-e-3", "gpt-image-1-mini"];

      for (const model of modelsToTry) {
        try {
          console.log(`[Image] Trying OpenAI model: ${model}`);
          const enriched = enrichPrompt(prompt, style, quality);
          const params = {
            model,
            prompt: enriched,
            n: 1,
            size,
          };
          if (model === "dall-e-3") {
            params.quality = quality;
            params.style = style === "vivid" ? "vivid" : "natural";
          }

          const response = await openai.images.generate(params);

          if (response?.data?.[0]?.url) {
            finalImageUrl = response.data[0].url;
            revisedPrompt = response.data[0].revised_prompt || prompt.trim();
            provider = `OpenAI (${model})`;
            console.log(`[Image] Successfully generated with OpenAI (${model})`);
            break;
          } else if (response?.data?.[0]?.b64_json) {
            finalImageUrl = `data:image/png;base64,${response.data[0].b64_json}`;
            revisedPrompt = response.data[0].revised_prompt || prompt.trim();
            provider = `OpenAI (${model})`;
            console.log(`[Image] Successfully generated with OpenAI base64 (${model})`);
            break;
          }
        } catch (openaiErr) {
          console.warn(`[Image] OpenAI (${model}) failed:`, openaiErr.message || openaiErr);
        }
      }
    }

    // 2. Seamless fallback to Pollinations FLUX photorealistic engine
    if (!finalImageUrl) {
      console.log("[Image] Using Pollinations AI FLUX engine with photorealistic DSLR tuning...");
      const { imageUrl, styledPrompt } = generatePollinationsUrl(prompt, size, quality, style);
      finalImageUrl = imageUrl;
      revisedPrompt = styledPrompt;
      provider = "FLUX Ultra-Real Engine";
    }

    // Check if a real photo alternative exists in parallel to suggest to the user
    let realAlternative = null;
    try {
      const quickReal = await findRealPhotos(cleanQuery);
      if (quickReal && quickReal.length > 0) {
        realAlternative = quickReal[0];
      }
    } catch (_) {}

    return res.json({
      success: true,
      data: {
        isRealPhoto: false,
        mode: "ai",
        image: finalImageUrl,
        imageUrl: finalImageUrl,
        prompt: prompt.trim(),
        revisedPrompt,
        size,
        quality,
        style,
        provider,
        realAlternative, // Suggest authentic photo if available!
        generated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Image] Error in generateImage:", error.message);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Image generation failed. Please try again.", error.message);
  }
};
