# Elite Hub Mobile (Expo)

Quick scaffold for a simple Expo app that links to your existing frontend and backend.

Run locally:

```bash
cd mobile
npm install
npx expo start
```

Notes:
- Edit `api.js` to set `API_BASE` and `WEB_BASE` to your machine IP (for device testing). Example: `http://192.168.1.10:5000`.
- The `Subjects` screen opens the web `pages/subjects.html` in a WebView by default — you can extend to fetch subject docs from the backend.
