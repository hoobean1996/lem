# Deployment

Shenbi frontend is deployed on Vercel.

## Automatic Deployment

Push to the `main` branch to trigger automatic deployment:

```bash
git push origin main
```

Vercel will automatically build and deploy the changes.

## Manual Build

To build locally:

```bash
npm run build
```

Build output goes to `dist/` directory.

## Environment

- Production URL: https://www.gigaboo.sg
- Vercel project is connected to this repository
