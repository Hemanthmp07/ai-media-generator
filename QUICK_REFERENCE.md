# 🚀 Quick Reference Card

## Start Development

```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)  
cd frontend && npm run dev

# Browser: http://localhost:5173
```

## Available Tools

| Feature | Path | Access |
|---------|------|--------|
| 🖼️ Image Generation | `/components/ImageGenerator.jsx` | Nav > Images |
| 🎬 Video Generation | `/components/VideoGenerator.jsx` | Nav > Videos |
| ⚙️ Batch Processor | `/components/BatchProcessor.jsx` | Nav > Batch |
| 📸 Gallery | `/components/GalleryHistory.jsx` | Nav > Gallery |
| ⚙️ Settings | `/components/Settings.jsx` | Nav > Settings |

## API Endpoints

```bash
# Images
POST   /api/image
POST   /api/prompt/enhance

# Videos  
POST   /api/video/generate
GET    /api/video/status/:id
GET    /api/video/list

# Batch
POST   /api/batch/process
GET    /api/batch/status/:id

# History
POST   /api/history/save
GET    /api/history?type=all&limit=20
DELETE /api/history/:id
POST   /api/history/clear
```

## Key Keyboard Shortcuts

- `🧪` Test Mode toggle for face capture
- `F12` Developer console
- `Ctrl+Shift+K` Search DevTools
- `Escape` Close modals

## Common Commands

```bash
# Install dependencies
npm install

# Run backend server
npm run dev

# Run frontend dev server
npm run dev

# Build for production (frontend)
npm run build

# Preview production build
npm run preview

# Format code
npm run format  # (if configured)

# Run tests
npm test  # (if configured)
```

## Environment Variables

**Backend (.env):**
```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
```

## File Locations

**Core App:** `frontend/src/components/App.jsx`
**Main Backend:** `backend/server.js`
**Middleware:** `backend/middleware/`
**Controllers:** `backend/controllers/`
**Routes:** `backend/routes/`

## Dependencies to Know

**Frontend:**
- React - UI framework
- Axios - API calls
- Tailwind - Styling

**Backend:**
- Express - Web server
- Zod - Validation
- Axios - HTTP requests

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 in use | `lsof -i :5000` then kill process |
| Port 5173 in use | Vite will auto-increment to 5174 |
| Dependencies fail | Delete node_modules & package-lock.json, then npm install |
| Camera won't work | Use 🧪 Test Mode or switch to real browser |
| Images slow | Normal - Pollinations API takes 3-5s |
| Nothing loads | Check both terminals are running |

## Code Structure

```
Frontend Component Flow:
App.jsx
  ├─→ NavBar (navigation)
  ├─→ ImageGenerator (main feature)
  ├─→ VideoGenerator (new)
  ├─→ BatchProcessor (new)
  ├─→ GalleryHistory (new)
  └─→ Settings (new)

Backend Request Flow:
Client Request
  ↓
Router (validation middleware)
  ↓
Controller (business logic)
  ↓
API Call (Pollinations, etc)
  ↓
Response (with error handling)
```

## Performance Tips

- Enable Test Mode for instant testing
- Batch generate images (faster than one-by-one)
- Use localStorage for presets
- Download high-quality PNG only when needed
- Clear history periodically

## Feature Highlights

✨ **No Sign-up Needed** - Works instantly
✨ **Free Image API** - Pollinations.ai
✨ **Test Mode** - Develop without camera
✨ **Batch Processing** - Do 10 at once
✨ **History Saved** - Everything cached locally
✨ **Responsive Design** - Works on mobile too

## Next Features to Build

1. Database (SQLite/MongoDB)
2. User accounts (authentication)
3. Real video generation API
4. Image upscaling
5. Favorites/collections
6. Share galleries

## Useful Links

- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Tailwind: https://tailwindcss.com
- Express: https://expressjs.com
- Zod: https://zod.dev
- Pollinations: https://pollinations.ai

## File Size Limits

- Prompts: 500 chars max
- Batch: 10 prompts max
- Images: Direct from API (no size limit)
- History: 100 images, 50 videos (expandable)

## Debug Mode

**Browser Console:**
```javascript
// Check API config
fetch('http://localhost:5000/api/image', { method: 'POST', ... })

// Check localStorage
localStorage.getItem('imagePresets')
localStorage.getItem('moodyAnalysisHistory')

// Check network tab
// F12 → Network → refresh page
```

**Server Logs:**
```bash
# Backend terminal shows all requests
# Check middleware/errorHandler.js for logging

# Frontend console (F12) shows component logs
console.log, console.error available
```

## Production Checklist

- [ ] Update .env files
- [ ] Set NODE_ENV=production
- [ ] Update CORS_ORIGIN
- [ ] Build frontend (npm run build)
- [ ] Test production build locally
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Update DNS/domain
- [ ] Test all endpoints
- [ ] Monitor error logs

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready
