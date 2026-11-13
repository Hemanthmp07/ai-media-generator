# AI Media Generator - Complete Guide

## 🚀 Project Overview

**AI Media Generator** is a comprehensive web application for creating and editing digital media using AI-powered tools. It provides image generation, video generation, batch processing, and advanced editing capabilities.

## ✨ Features

### 🖼️ Image Generation
- Generate high-quality images from text prompts
- Prompt enhancement with cinematic improvements
- Real-time image preview
- Multiple editing presets (Original, Cinematic, Monochrome, Vivid, Custom)
- Adjustable filters (brightness, contrast, saturation, blur, sepia, grayscale)
- Download in PNG or JPG formats

### 📸 Face Capture & Analysis
- Real-time webcam face detection
- Mood analysis with confidence scoring
- Photography suggestions based on lighting and expression
- Face snapshot preview
- Test mode for development (🧪 Test Mode toggle)

### 🎬 Video Generation
- Generate videos from text prompts
- Adjustable duration (1-60 seconds)
- Multiple style options (Cinematic, Animated, Realistic)
- Real-time status tracking

### ⚙️ Batch Processing
- Process up to 10 prompts simultaneously
- Bulk image generation
- Progress tracking
- Detailed results with direct links

### 📸 Gallery & History
- Auto-save generated media
- Browse generation history
- Filter by type (Images, Videos, All)
- Delete individual items or clear all
- Pagination support (20 items default)

### ⚙️ Settings Panel
- Auto-save toggle
- Notification preferences
- Default quality settings
- Theme customization
- Application information

### 📊 Advanced Error Handling
- Comprehensive validation
- Detailed error messages
- Global error handler
- Request logging

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js 4.18+
- **Runtime**: Node.js
- **Database**: In-memory storage (expandable to SQLite, MongoDB)
- **Validation**: Zod
- **APIs**: Pollinations AI for image generation

### Frontend
- **Framework**: React 18.3+
- **Build Tool**: Vite 5.0+
- **Styling**: Tailwind CSS 4.1+
- **HTTP Client**: Axios 1.13+
- **UI Components**: Custom components with React hooks

## 📋 Project Structure

```
ai-media-generator/
├── backend/
│   ├── middleware/
│   │   ├── errorHandler.js       # Global error handling
│   │   └── validation.js         # Request validation with Zod
│   ├── controllers/
│   │   ├── imageController.js    # Image generation
│   │   ├── videoController.js    # Video generation
│   │   ├── promptController.js   # Prompt enhancement
│   │   ├── batchController.js    # Batch processing
│   │   └── historyController.js  # History management
│   ├── routes/
│   │   ├── imageRoutes.js
│   │   ├── videoRoutes.js
│   │   ├── promptRoutes.js
│   │   ├── batchRoutes.js
│   │   └── historyRoutes.js
│   ├── config/
│   │   └── ApiConfig.js
│   ├── server.js                 # Express app setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx           # Main app with navigation
│   │   │   ├── ImageGenerator.jsx
│   │   │   ├── VideoGenerator.jsx
│   │   │   ├── BatchProcessor.jsx
│   │   │   ├── GalleryHistory.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Toast.jsx         # Notifications
│   │   │   ├── Modal.jsx         # Dialogs
│   │   │   ├── Loading.jsx       # Spinners & Progress
│   │   │   ├── api.js            # Axios setup
│   │   │   ├── App.css
│   │   │   └── CoolButton.jsx
│   │   ├── main.jsx
│   │   └── index.html
│   ├── vite.config.mjs
│   └── package.json
│
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm
- A modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam for face capture feature (optional)

### Installation

1. **Clone or Extract Project**
```bash
cd "ai media generator run"
```

2. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Return to root
cd ..
```

3. **Configure Environment** (Optional)
Create `.env` in backend folder:
```
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_key_here
```

### Running the Project

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on `http://localhost:5173`

Then open your browser to `http://localhost:5173` and start creating!

## 📚 API Endpoints

### Image Generation
- `POST /api/image` - Generate image from prompt
- `POST /api/prompt/enhance` - Enhance prompt with quality keywords

### Video Generation
- `POST /api/video/generate` - Generate video
- `GET /api/video/status/:videoId` - Check generation status
- `GET /api/video/list` - List user videos

### Batch Operations
- `POST /api/batch/process` - Process multiple prompts
- `GET /api/batch/status/:batchId` - Check batch status

### History Management
- `POST /api/history/save` - Save to history
- `GET /api/history` - Get history with filters
- `DELETE /api/history/:id` - Delete history item
- `POST /api/history/clear` - Clear all history

## 🎯 Key Features Implementation

### Real-time Webcam Integration
```javascript
navigator.mediaDevices.getUserMedia({
  video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
  audio: false,
});
```

### Face Mood Detection
- Analyzes brightness, skin tones, warmth
- Returns mood (Good/Bad) with confidence score
- Provides photography suggestions

### Error Handling Pattern
```javascript
const validate = (schemaKey) => (req, res, next) => {
  // Validation logic with Zod
};

app.use(errorHandler); // Global error handler
```

### State Management
- React hooks (useState, useEffect, useRef, useCallback)
- localStorage for persistence
- No external state management needed (can add Redux if needed)

## 🔧 Customization Guide

### Add New Feature
1. Create controller in `backend/controllers/newFeature.js`
2. Add route in `backend/routes/newRoutes.js`
3. Create React component in `frontend/src/components/NewComponent.jsx`
4. Import in `App.jsx` and add to navigation

### Change Image API
Edit `backend/controllers/imageController.js`:
```javascript
// Replace this URL with your preferred AI image API
const imageUrl = `https://api.yourservice.com/generate?prompt=${encodeURIComponent(prompt)}`;
```

### Add Database
Install: `npm install sqlite3 --save`
Create `backend/db/init.js` for schema setup

## 📊 Performance Optimization

- Vite for fast development builds
- React lazy loading for components
- Image lazy loading in gallery
- Debounced prompt input
- Cached API responses

## 🔒 Security Considerations

- Input validation with Zod
- CORS enabled for localhost development
- Request size limits (50MB)
- Error messages sanitized in production

## 🐛 Troubleshooting

**Issue: Camera not working**
- Ensure you're in a real browser (Chrome/Firefox/Edge), not embedded VS Code browser
- Check camera permissions in browser settings
- Toggle "🧪 Test Mode" for development

**Issue: Image generation fails**
- Check internet connection
- Verify Pollinations API is available
- Check prompt length (max 500 characters)

**Issue: Port already in use**
```bash
# Change port in backend
# Edit backend/.env or set via environment variable
PORT=5001 npm run dev
```

## 📈 Future Enhancements

- [ ] Database integration (SQLite/MongoDB)
- [ ] User authentication & accounts
- [ ] Real video generation API integration
- [ ] Advanced AI models (DALL-E, Midjourney, Stable Diffusion)
- [ ] Image upscaling and restoration
- [ ] Music/audio generation
- [ ] Animation creation
- [ ] Mobile app (React Native)
- [ ] Progressive Web App (PWA)
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard

## 📝 License

This project is available for personal and educational use.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review console errors (F12)
3. Check backend logs (terminal)

---

**Made with ✨ - AI Media Generator v1.0.0**
