<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# DEAR-WHOEVER

This repository contains the website source code for the DEAR-WHOEVER project.

## Run locally

**Prerequisites:** Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Publish with GitHub Pages

This repository now includes `.github/workflows/deploy-pages.yml` to build and deploy automatically.

1. Push changes to the `main` branch.
2. Open your repository on GitHub: **Settings → Pages**.
3. In **Build and deployment**, set **Source** to **GitHub Actions**.
4. Wait for the **Deploy to GitHub Pages** workflow to finish.

Your public site URL will be:
`https://reachmuhammadahmed.github.io/DEAR-WHOEVER/`
