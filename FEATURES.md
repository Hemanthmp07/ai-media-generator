# 🎨 AI Media Generator - Feature Guide

## Complete Feature Walkthrough

### 1. 🖼️ Image Generation

**What it does:**
Generate professional AI images from text descriptions using the Pollinations API.

**How to use:**
1. Click "Images" in navigation
2. Enter a detailed prompt (e.g., "A serene mountain landscape at sunset with snow")
3. (Optional) Click "Enhance Prompt" to add cinematic quality keywords
4. Click "Generate Image"
5. Wait for the AI to generate your image

**Preset Filters:**
- **Original**: Unmodified generated image
- **Cinematic**: Enhanced colors, high contrast, professional look
- **Monochrome**: Black and white artistic style
- **Vivid**: Vibrant, saturated colors
- **Custom**: Create your own with 6 filter sliders

**Available Filters:**
- **Brightness** (0-200%): Adjust overall lightness
- **Contrast** (0-200%): Enhance difference between light/dark
- **Saturation** (0-200%): Boost or reduce colors
- **Blur** (0-12px): Soften image gradually
- **Sepia** (0-100%): Warm, vintage brown tone
- **Grayscale** (0-100%): Remove colors progressively

**Download Options:**
- PNG: Lossless, best quality, larger file
- JPG: Compressed, smaller file, quick share

---

### 2. 📸 Face Capture & Mood Analysis

**What it does:**
Analyze your face in real-time using your webcam to determine your mood and provide photography suggestions.

**Requirements:**
- Webcam access (grant permission when prompted)
- Real browser (Chrome, Firefox, Edge) - NOT VS Code embedded browser

**How to use:**
1. In Image Generator, click "Start Camera"
2. Grant camera permission when prompted
3. Position your face in the camera
4. Click "Capture Face & Analyze Mood"
5. See mood results with confidence score

**Test Mode (🧪):**
If you don't have a camera or are in VS Code:
1. Click "🧪 Test Mode" toggle
2. Click "Start Camera" - synthetic face generates instantly
3. Click "Capture Face & Analyze Mood"
4. Results display with test face preview

**Mood Analysis Explains:**
- **Good Mood**: Bright lighting, warm skin tones, well-lit face
- **Bad Mood**: Dark lighting, cool tones, shadowed areas
- **Score**: 0-100% confidence based on pixel analysis
- **Suggestions**: Photography tips based on detected lighting

**Snapshot Preview:**
After mood analysis, see:
- Original face snapshot
- Detected face region highlighted
- Mood emoji and confidence percentage
- Suggested camera adjustments

---

### 3. 🎬 Video Generation

**What it does:**
Create short AI videos from text prompts with customizable duration and style.

**How to use:**
1. Click "Videos" in navigation
2. Write your video description
3. Select duration (1-60 seconds)
4. Choose style (Cinematic/Animated/Realistic)
5. Click "Generate Video"
6. Copy the generated video URL

**Styles:**
- **Cinematic**: Movie-like, high production quality
- **Animated**: Cartoon or animation style
- **Realistic**: Photorealistic footage

**Current Status:**
- Framework ready for real video API integration
- Currently returns demo URLs
- Next: Connect to Runway, Synthesia, or D-ID

---

### 4. ⚙️ Batch Processor

**What it does:**
Generate multiple images from different prompts in parallel for maximum efficiency.

**How to use:**
1. Click "Batch" in navigation
2. Enter prompts (one per line, max 10)
3. See prompt count increase as you type
4. Click "Process Batch"
5. View results grid with all generated images
6. Click "View" to see full resolution
7. No limit on batch runs - queue as many as you want

**Batch Features:**
- Process up to 10 prompts simultaneously
- Parallel generation (faster than one-by-one)
- View results in gallery format
- Direct links to each generated image
- Summary showing success/error status

**Example Input:**
```
A futuristic city with flying cars
An underwater coral reef ecosystem
A cozy coffee shop in Paris
A dragon flying over mountains
A beautiful aurora borealis
```

---

### 5. 📸 Gallery & History

**What it does:**
Browse, organize, and manage all your generated creations with filtering and search.

**How to use:**
1. Click "Gallery" in navigation
2. View all your generated items
3. Filter by type: All / Images / Videos
4. Hover over items to see details
5. Click "View" to open full image
6. Click "Delete" to remove item
7. Click "Clear All" to reset history

**Gallery Features:**
- Thumbnail preview grid
- Shows generation date/time
- Original prompt displayed
- Direct download/view links
- Individual item deletion
- Bulk clear option

**Filters:**
- **All**: Show everything
- **Images**: Only generated images
- **Videos**: Only generated videos

---

### 6. ⚙️ Settings

**What it does:**
Customize app behavior and preferences for your workflow.

**Settings Available:**

1. **Auto-save Generations**
   - Toggle: Enable/Disable
   - Effect: Automatically save all generations to history
   - Default: Enabled

2. **Enable Notifications**
   - Toggle: Enable/Disable
   - Effect: Show toast messages for success/error events
   - Default: Enabled

3. **Default Quality**
   - Options: Low / Medium / High
   - Effect: Set default image quality for new generations
   - Low: Faster processing, smaller files
   - High: Better quality, larger files

4. **App Information**
   - Version: Current app version
   - Built with: Technologies used
   - Image AI: API provider information

---

## 🎯 Workflow Examples

### Example 1: Create a Cinematic Poster
```
1. Go to Image Generation
2. Prompt: "Movie poster for sci-fi thriller, neon colors, dramatic lighting"
3. Click Enhance Prompt
4. Generate Image
5. Apply "Cinematic" preset
6. Download as PNG
```

### Example 2: Batch Social Media Content
```
1. Go to Batch Processor
2. Enter 5 prompts for your brand:
   - Coffee shop aesthetic photo
   - Morning motivation quote visual
   - Product showcase modern design
   - Team collaboration illustration
   - Success celebration imagery
3. Process all at once
4. Download all for social media use
```

### Example 3: Mood-Based Selfie Analysis
```
1. Go to Image Generation
2. Click Start Camera (or Test Mode)
3. Capture and Analyze
4. See mood score
5. Take a selfie based on suggestions
6. Adjust lighting/expression
7. Analyze again to see improvement
```

### Example 4: Video & Thumbnail Combo
```
1. Go to Video Generator
2. Create video: "Cinematic intro sequence with company logo"
3. Go to Image Generator
4. Create thumbnail from video concept
5. Batch generate 3 alternative thumbnails
6. Save best for video
```

---

## 💡 Pro Tips

**Image Generation:**
- Be specific in prompts (colors, mood, style, lighting)
- Use artistic references ("in style of X artist")
- Include composition hints ("close-up portrait", "wide landscape")
- Enhance prompts for better results

**Face Analysis:**
- Good lighting = accurate mood detection
- Front-facing angle works best
- Whole face should be visible
- Try different expressions to see score changes

**Batch Processing:**
- Use similar prompts for consistency
- Group by theme (all portraits, all landscapes)
- Generate variations of the same concept
- 10 images = ~2-3 minutes processing time

**Settings:**
- Enable notifications for completion alerts
- Auto-save ensures you never lose work
- Download favorites immediately
- Use settings to match your workflow

---

## 🚀 Keyboard Shortcuts (Coming Soon)

- `Ctrl+K`: Focus prompt input
- `Ctrl+Enter`: Generate/Process
- `Escape`: Close modal/cancel
- `G`: Go to Gallery
- `S`: Go to Settings

---

## 📊 Data & Privacy

**What's Stored:**
- Generated images and videos
- Prompts you entered
- Generation timestamps
- Your filter presets

**What's NOT Stored:**
- Your camera feed
- Personal facial data
- Browser cookies
- Tracking information

**Storage Location:**
- Frontend: localStorage (browser)
- Backend: In-memory (development) or database (production)
- Pollinations: API doesn't store data

---

## 🔧 Troubleshooting

**Camera won't start:**
- Check browser permissions (Settings → Privacy)
- Use Test Mode if camera unavailable
- Restart browser
- Try different browser (Chrome recommended)

**Generation fails:**
- Check internet connection
- Try simpler prompt
- Wait a moment, then retry
- Check browser console for errors

**Gallery empty:**
- Check if you've generated anything
- Verify Auto-save is enabled
- Check localStorage in DevTools
- Auto-clear might be active

**Batch too slow:**
- Reduce number of prompts
- Try one image first to test
- Check internet speed
- Backend might be processing

---

Made with ✨ - Happy Creating!
