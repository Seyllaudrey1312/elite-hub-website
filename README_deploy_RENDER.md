# Deploying Elite Hub Backend on Render

This document describes a simple, repeatable way to deploy the backend on Render using the repository or `render.yaml`, plus an optional GitHub Actions workflow to build and publish the backend Docker image to GitHub Container Registry (GHCR).

Prerequisites
- A Render account (https://render.com) connected to your GitHub organization or user account.
- The repository pushed to GitHub with this code.
- A MongoDB deployment (MongoDB Atlas recommended) and the connection string.

Quick Deploy (recommended)
1. Sign into Render and choose "New" → "Web Service".
2. Connect your GitHub repo and select the repo and the `main` branch.
3. Environment: choose **Docker** (we provide `backend/Dockerfile`).
4. Set the Dockerfile path to `backend/Dockerfile` and the root to the repository root.
5. Set the `Start Command` to `node server.js` (or leave blank if Render detects it).
6. Add environment variables (see `Environment variables` below).
7. Create the service — Render will build and deploy your app.

Using `render.yaml` (infrastructure as code)
- You can place `render.yaml` at the repository root and use Render's dashboard to import the file or use the Render CLI. The repository already includes a sample `render.yaml` you can customize.

Environment variables
Copy values from `backend/.env.example` and set them in Render's dashboard for the service:
- `MONGODB_URI` (required) — set to your Atlas connection string.
- `PORT` (optional) — defaults to `3000`.
- `JWT_SECRET` (required for auth tokens).
- `SMTP_*` (optional) — if you want outgoing email via SMTP.
- `ZOOM_API_KEY` / `ZOOM_API_SECRET` (optional) — required if you use Zoom integration.

GitHub Actions and Render deploy webhook
- To allow the CI workflow to trigger a Render deploy, add these GitHub repository secrets:
	- `RENDER_API_KEY` — create a Render API key with `deploys:write` permissions and add it as a repo secret.
	- `RENDER_SERVICE_ID` — the Render service ID for your `elite-hub-backend` service (found in the Render dashboard or API).

The included GitHub Actions workflow (`.github/workflows/ci-deploy-backend.yml`) will build and push the backend image to GHCR and then call the Render API to create a new deploy using the current commit SHA. If the secrets are not present the workflow will skip the remote deploy trigger.

Persistent storage
- The backend stores uploaded files under the repo's `frontend/assets` or managed uploads. For production, prefer an S3-compatible object store (AWS S3, DigitalOcean Spaces). Update routes/config accordingly.

Database
- Use MongoDB Atlas for production. Create a cluster, create a user, whitelist Render IPs (optional) or use VPC peering if needed, then set `MONGODB_URI`.

Optional: CI that builds and publishes Docker image
- The workflow `.github/workflows/ci-deploy-backend.yml` builds the backend image from `backend/Dockerfile` and pushes tags to GHCR. This is useful if you want to reference a built image elsewhere.

Local testing
1. Start services locally with Docker Compose:

```bash
docker-compose up --build
```

2. Visit `http://localhost:3000` (or your mapped port).

Notes & Checklist
- Ensure the `backend/.env.example` values are supplied in Render.
- Use MongoDB Atlas for production reliability.
- Test the service locally before pushing to Render.
- Consider adding a managed object store for uploaded files.

If you want, I can also:
- Add Render-specific `env` definitions to `render.yaml` (currently placeholders).
- Add a GitHub Action step to call the Render API to trigger a deploy after pushing an image.
