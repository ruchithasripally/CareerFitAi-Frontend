# CareerFit AI — Frontend Client

The frontend for CareerFit AI is a modern, responsive, zero-dependency web application engineered using HTML5, CSS3, and modern JavaScript modules.

---

## 📁 Directory Structure

```text
frontend/
├── index.html        # Landing page with hero, workflow, & illustrative preview
├── upload.html       # Resume file upload with drag-and-drop & validation
├── results.html      # Skills dashboard with green badges, search, & export
├── css/
│   └── styles.css    # Unified SaaS design system & responsive styling
├── js/
│   ├── config.js     # API base URL configuration & resolution
│   ├── api.js        # REST API client using fetch()
│   ├── upload.js     # Upload form interaction, validation, and progress
│   └── results.js    # Results dashboard rendering, filtering, and export
├── vercel.json       # Vercel deployment routing & security headers
├── .env.example      # Example environment variables
└── README.md         # Frontend documentation
```

---

## 🚀 Local Development

You can serve the frontend with any static HTTP server:

### Option A: VS Code Live Server
1. Open the `CareerFitAI/frontend` directory in VS Code.
2. Click **Go Live** at the bottom-right corner.
3. Your browser will open at `http://localhost:5500`.

### Option B: Node `npx serve` or `http-server`
```bash
# From the frontend directory
npx serve -l 3000 .
```

### Option C: Python HTTP Server
```bash
# Python 3
python -m http.server 3000
```

---

## ⚙️ Backend API Configuration

By default in local development, `js/config.js` directs API requests to:
```text
http://localhost:8080
```

### Connecting to Deployed Render Backend
You can point the frontend to your Render service in one of three ways:

1. **Meta Tag Injection** in the HTML `<head>`:
   ```html
   <meta name="api-base-url" content="https://your-careerfitai-backend.onrender.com">
   ```
2. **Browser LocalStorage Override** (instant without code change):
   Open the browser Developer Console (`F12`) on any page and execute:
   ```javascript
   CareerFitConfig.setApiBaseUrl('https://your-careerfitai-backend.onrender.com');
   ```
3. **Window Global Injection**:
   ```html
   <script>window.__API_BASE_URL__ = 'https://your-careerfitai-backend.onrender.com';</script>
   ```

---

## ☁️ Deploying to Vercel

1. **Push your repository to GitHub**:
   ```bash
   git add .
   git commit -m "Add CareerFit AI frontend"
   git push origin main
   ```
2. **Log into [Vercel](https://vercel.com)**:
   - Click **Add New Project** → **Import Git Repository**.
   - Select your `CareerFitAI` repository.
3. **Configure Project Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend` (Click *Edit* and choose the `frontend` folder).
   - **Build Command**: Leave blank (static site).
   - **Output Directory**: Leave blank (`.` or `./`).
4. **Deploy**:
   - Click **Deploy**. Vercel will deploy the site and provide a production URL (e.g., `https://careerfitai.vercel.app`).
5. **Update CORS on Backend**:
   - Add your Vercel URL to the backend `FRONTEND_URL` environment variable on Render.
